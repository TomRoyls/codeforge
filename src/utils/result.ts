/**
 * Result type utility module for safer error handling.
 *
 * Provides a `Result<T, E>` discriminated union pattern as an alternative to
 * throwing exceptions. Inspired by Rust's `Result` type, this module encourages
 * explicit error handling at the call site, making failure cases visible in the
 * type system.
 *
 * @example
 * ```ts
 * import { ok, err, fromThrowable, type Result } from './result.js'
 *
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err('Division by zero')
 *   return ok(a / b)
 * }
 *
 * const result = divide(10, 2)
 * const message = result.match(
 *   (value) => `Result: ${value}`,
 *   (error) => `Error: ${error}`,
 * )
 * ```
 */

// ---------------------------------------------------------------------------
// Internal variant symbols
// ---------------------------------------------------------------------------

const OkSymbol = Symbol('Result.Ok')
const ErrSymbol = Symbol('Result.Err')

// ---------------------------------------------------------------------------
// Type-level definitions
// ---------------------------------------------------------------------------

/**
 * Represents a successful result carrying a value of type `T`.
 *
 * Created via the {@link ok} factory function.
 */
export type Ok<T> = Result<T, never>

/**
 * Represents a failed result carrying an error of type `E`.
 *
 * Created via the {@link err} factory function.
 */
export type Err<E> = Result<never, E>

/**
 * A discriminated union representing either a successful value (`Ok`) or a
 * failure (`Err`).
 *
 * Prefer using the factory functions {@link ok} and {@link err} to construct
 * instances, and the instance methods (`isOk`, `isErr`, `match`, etc.) to
 * consume them.
 *
 * @typeParam T - The type of the success value.
 * @typeParam E - The type of the error value. Defaults to `Error`.
 */
export type Result<T, E = Error> = ResultClass<T, E>

// ---------------------------------------------------------------------------
// Implementation class (hidden behind the type alias above)
// ---------------------------------------------------------------------------

/**
 * Internal implementation — use the public type alias {@link Result} instead.
 *
 * The class is exported only so the type alias can reference it. Prefer
 * constructing instances with {@link ok}, {@link err}, or {@link fromThrowable}.
 */
export class ResultClass<T, E> {
  /** @internal */
  private readonly _tag: typeof OkSymbol | typeof ErrSymbol
  /** @internal */
  private readonly _value: T
  /** @internal */
  private readonly _error: E

  private constructor(tag: typeof OkSymbol, value: T, error: never)
  private constructor(tag: typeof ErrSymbol, value: never, error: E)
  private constructor(tag: typeof OkSymbol | typeof ErrSymbol, value: T, error: E) {
    this._tag = tag
    this._value = value
    this._error = error
  }

  // -----------------------------------------------------------------------
  // Factory methods (static)
  // -----------------------------------------------------------------------

  /**
   * Create a successful `Result` containing `value`.
   *
   * @example
   * ```ts
   * const r = ResultClass.ok(42) // Result<number, never>
   * ```
   */
  public static ok<T>(value: T): ResultClass<T, never> {
    return new ResultClass(OkSymbol, value, undefined as never)
  }

  /**
   * Create a failed `Result` containing `error`.
   *
   * @example
   * ```ts
   * const r = ResultClass.err('not found') // Result<never, string>
   * ```
   */
  public static err<E>(error: E): ResultClass<never, E> {
    return new ResultClass(ErrSymbol, undefined as never, error)
  }

  // -----------------------------------------------------------------------
  // Predicates
  // -----------------------------------------------------------------------

  /**
   * Returns `true` when this result represents a success.
   *
   * Narrows the type so that subsequent access to the value is safe.
   */
  public isOk(): this is ResultClass<T, E> & { _value: T } {
    return this._tag === OkSymbol
  }

  /**
   * Returns `true` when this result represents a failure.
   *
   * Narrows the type so that subsequent access to the error is safe.
   */
  public isErr(): this is ResultClass<T, E> & { _error: E } {
    return this._tag === ErrSymbol
  }

  // -----------------------------------------------------------------------
  // Unwrapping
  // -----------------------------------------------------------------------

  /**
   * Return the contained value if `Ok`, otherwise throw the contained error.
   *
   * If the error is not an `Error` instance it is wrapped in one before
   * throwing so that a stack trace is available.
   *
   * @throws The contained error (or a wrapped version of it).
   */
  public unwrap(): T {
    if (this._tag === OkSymbol) return this._value
    const e = this._error
    throw e instanceof Error ? e : new Error(String(e))
  }

  /**
   * Return the contained value if `Ok`, otherwise return `defaultValue`.
   *
   * @example
   * ```ts
   * const port = parsePort(input).unwrapOr(3000)
   * ```
   */
  public unwrapOr(defaultValue: T): T {
    return this._tag === OkSymbol ? this._value : defaultValue
  }

  /**
   * Return the contained value if `Ok`, otherwise invoke `fn` and return its
   * result. The function receives the contained error.
   *
   * @example
   * ```ts
   * const value = result.unwrapOrElse((e) => fallback(e))
   * ```
   */
  public unwrapOrElse(fn: (error: E) => T): T {
    return this._tag === OkSymbol ? this._value : fn(this._error)
  }

  // -----------------------------------------------------------------------
  // Transformations
  // -----------------------------------------------------------------------

  /**
   * Transform the success value with `fn`, leaving an `Err` untouched.
   *
   * @example
   * ```ts
   * const doubled = ok(5).map((n) => n * 2) // Ok(10)
   * ```
   */
  public map<U>(fn: (value: T) => U): ResultClass<U, E> {
    return this._tag === OkSymbol
      ? new ResultClass(OkSymbol, fn(this._value), undefined as never)
      : (this as unknown as ResultClass<U, E>)
  }

  /**
   * Transform the error value with `fn`, leaving an `Ok` untouched.
   *
   * @example
   * ```ts
   * const enriched = err('not found').mapErr((m) => new Error(m))
   * ```
   */
  public mapErr<F>(fn: (error: E) => F): ResultClass<T, F> {
    return this._tag === ErrSymbol
      ? new ResultClass(ErrSymbol, undefined as never, fn(this._error))
      : (this as unknown as ResultClass<T, F>)
  }

  // -----------------------------------------------------------------------
  // Chaining
  // -----------------------------------------------------------------------

  /**
   * Chain a function that also returns a `Result` (flatMap).
   *
   * If this result is `Ok`, invoke `fn` with the value and return the new
   * result. If this result is `Err`, return it unchanged.
   *
   * @example
   * ```ts
   * const r = ok('file.ts')
   *   .andThen((name) => readFile(name))
   *   .andThen((content) => parse(content))
   * ```
   */
  public andThen<U>(fn: (value: T) => ResultClass<U, E>): ResultClass<U, E> {
    return this._tag === OkSymbol ? fn(this._value) : (this as unknown as ResultClass<U, E>)
  }

  /**
   * Chain an error-recovery function.
   *
   * If this result is `Err`, invoke `fn` with the error and return the new
   * result. If this result is `Ok`, return it unchanged.
   *
   * @example
   * ```ts
   * const r = readCache()
   *   .orElse(() => fetchFromNetwork())
   * ```
   */
  public orElse<F>(fn: (error: E) => ResultClass<T, F>): ResultClass<T, F> {
    return this._tag === ErrSymbol ? fn(this._error) : (this as unknown as ResultClass<T, F>)
  }

  // -----------------------------------------------------------------------
  // Pattern matching
  // -----------------------------------------------------------------------

  /**
   * Destructure the result by invoking the appropriate handler.
   *
   * @example
   * ```ts
   * const label = result.match(
   *   (value) => `Success: ${value}`,
   *   (error) => `Failure: ${error}`,
   * )
   * ```
   */
  public match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    return this._tag === OkSymbol ? onOk(this._value) : onErr(this._error)
  }

  // -----------------------------------------------------------------------
  // Serialization
  // -----------------------------------------------------------------------

  /**
   * Return a plain-object representation suitable for `JSON.stringify`.
   *
   * @example
   * ```ts
   * console.log(JSON.stringify(result.toJSON(), null, 2))
   * ```
   */
  public toJSON(): { ok: true; value: T } | { ok: false; error: E } {
    return this._tag === OkSymbol
      ? { ok: true, value: this._value }
      : { ok: false, error: this._error }
  }
}

// ---------------------------------------------------------------------------
// Public factory functions
// ---------------------------------------------------------------------------

/**
 * Create a successful {@link Result} wrapping `value`.
 *
 * @typeParam T - The type of the success value.
 */
export function ok<T>(value: T): Result<T, never> {
  return ResultClass.ok(value)
}

/**
 * Create a failed {@link Result} wrapping `error`.
 *
 * @typeParam E - The type of the error value.
 */
export function err<E>(error: E): Result<never, E> {
  return ResultClass.err(error)
}

/**
 * Wrap a potentially-throwing function so it returns a `Result` instead.
 *
 * If `fn` completes normally, its return value is wrapped in `Ok`. If `fn`
 * throws, the caught error is wrapped in `Err`.
 *
 * @typeParam T - The return type of `fn`.
 * @typeParam E - The type used to represent errors. Defaults to `Error`.
 *
 * @example
 * ```ts
 * const result = fromThrowable(() => JSON.parse(input))
 * // Result<unknown, unknown> — safe to handle without try/catch
 * ```
 */
export function fromThrowable<T>(fn: () => T): Result<T, unknown> {
  try {
    return ok(fn())
  } catch (error: unknown) {
    return err(error)
  }
}
