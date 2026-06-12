export class ObservableValue<T> {
  private _value: T
  private listeners = new Set<(newValue: T, oldValue: T) => void>()

  constructor(initialValue: T) {
    this._value = initialValue
  }

  get value(): T {
    return this._value
  }

  set value(newValue: T) {
    if (newValue === this._value) return
    const old = this._value
    this._value = newValue
    for (const listener of this.listeners) {
      listener(newValue, old)
    }
  }

  subscribe(listener: (newValue: T, oldValue: T) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  get listenerCount(): number {
    return this.listeners.size
  }

  unsubscribeAll(): void {
    this.listeners.clear()
  }

  transform(fn: (current: T) => T): void {
    this.value = fn(this._value)
  }

  toString(): string {
    return String(this._value)
  }

  toJSON(): T {
    return this._value
  }

  clone(): ObservableValue<T> {
    const copy = new ObservableValue<T>(this._value)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ObservableValue)) return false
    return this._value === other._value
  }
}
