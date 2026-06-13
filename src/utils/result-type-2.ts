export class ResultType2<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly _value: T | undefined,
    private readonly _error: E | undefined,
  ) {}

  static ok<T, E>(value: T): ResultType2<T, E> {
    return new ResultType2<T, E>(true, value, undefined)
  }

  static err<T, E>(error: E): ResultType2<T, E> {
    return new ResultType2<T, E>(false, undefined, error)
  }

  get isOk(): boolean { return this._ok }
  get isErr(): boolean { return !this._ok }

  get value(): T {
    if (!this._ok) throw new Error('Cannot get value from Err')
    return this._value as T
  }

  get error(): E {
    if (this._ok) throw new Error('Cannot get error from Ok')
    return this._error as E
  }

  unwrap(): T {
    if (!this._ok) throw new Error(`Unwrapped Err: ${this._error}`)
    return this._value as T
  }

  unwrapOr(defaultValue: T): T {
    return this._ok ? this._value as T : defaultValue
  }

  map<R>(fn: (v: T) => R): ResultType2<R, E> {
    return this._ok ? ResultType2.ok(fn(this._value as T)) : ResultType2.err(this._error as E)
  }

  mapErr<F>(fn: (e: E) => F): ResultType2<T, F> {
    return this._ok ? ResultType2.ok(this._value as T) : ResultType2.err(fn(this._error as E))
  }

  andThen<R>(fn: (v: T) => ResultType2<R, E>): ResultType2<R, E> {
    return this._ok ? fn(this._value as T) : ResultType2.err(this._error as E)
  }

  match<R>(onOk: (v: T) => R, onErr: (e: E) => R): R {
    return this._ok ? onOk(this._value as T) : onErr(this._error as E)
  }

  static fromThrow<T>(fn: () => T): ResultType2<T, Error> {
    try { return ResultType2.ok(fn()) }
    catch (e) { return ResultType2.err(e instanceof Error ? e : new Error(String(e))) }
  }

  static async fromAsync<T>(fn: () => Promise<T>): Promise<ResultType2<T, Error>> {
    try { return ResultType2.ok(await fn()) }
    catch (e) { return ResultType2.err(e instanceof Error ? e : new Error(String(e))) }
  }

  toString(): string { return JSON.stringify({ ok: this._ok, value: this._value, error: this._error }) }
  toJSON(): Record<string, unknown> { return { ok: this._ok, value: this._value, error: this._error } }
  clone(): ResultType2<T, E> { return this._ok ? ResultType2.ok(this._value as T) : ResultType2.err(this._error as E) }
  equals(other: unknown): boolean {
    if (!(other instanceof ResultType2)) return false
    return this._ok === other._ok && this._value === other._value && this._error === other._error
  }
}
