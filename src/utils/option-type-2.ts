export class OptionType2<T> {
  private constructor(private readonly _value: T | undefined, private readonly _hasValue: boolean) {}

  static some<T>(value: T): OptionType2<T> {
    return new OptionType2(value, true)
  }

  static none<T>(): OptionType2<T> {
    return new OptionType2<T>(undefined, false)
  }

  static from<T>(value: T | undefined | null): OptionType2<T> {
    return value === undefined || value === null ? OptionType2.none<T>() : OptionType2.some(value)
  }

  get hasValue(): boolean { return this._hasValue }
  get isEmpty(): boolean { return !this._hasValue }

  get value(): T {
    if (!this._hasValue) throw new Error('Cannot get value from None')
    return this._value as T
  }

  unwrap(): T {
    if (!this._hasValue) throw new Error('Unwrapped None')
    return this._value as T
  }

  unwrapOr(defaultValue: T): T {
    return this._hasValue ? this._value as T : defaultValue
  }

  unwrapOrElse(fn: () => T): T {
    return this._hasValue ? this._value as T : fn()
  }

  map<R>(fn: (v: T) => R): OptionType2<R> {
    return this._hasValue ? OptionType2.some(fn(this._value as T)) : OptionType2.none<R>()
  }

  flatMap<R>(fn: (v: T) => OptionType2<R>): OptionType2<R> {
    return this._hasValue ? fn(this._value as T) : OptionType2.none<R>()
  }

  filter(pred: (v: T) => boolean): OptionType2<T> {
    if (!this._hasValue) return this
    return pred(this._value as T) ? this : OptionType2.none<T>()
  }

  match<R>(onSome: (v: T) => R, onNone: () => R): R {
    return this._hasValue ? onSome(this._value as T) : onNone()
  }

  toArray(): T[] {
    return this._hasValue ? [this._value as T] : []
  }

  toString(): string { return JSON.stringify({ hasValue: this._hasValue, value: this._value }) }
  toJSON(): Record<string, unknown> { return { hasValue: this._hasValue, value: this._value } }
  clone(): OptionType2<T> { return this._hasValue ? OptionType2.some(this._value as T) : OptionType2.none<T>() }
  equals(other: unknown): boolean {
    if (!(other instanceof OptionType2)) return false
    return this._hasValue === other._hasValue && this._value === other._value
  }
}
