export class Subject<V> {
  private subscribers: Array<(value: V) => void> = []
  private _value: V
  private _version = 0

  constructor(initial: V) {
    this._value = initial
  }

  get value(): V {
    return this._value
  }

  get version(): number {
    return this._version
  }

  get subscriberCount(): number {
    return this.subscribers.length
  }

  set(value: V): void {
    this._value = value
    this._version++
    for (const fn of this.subscribers) fn(value)
  }

  subscribe(fn: (value: V) => void): () => void {
    this.subscribers.push(fn)
    return () => {
      const idx = this.subscribers.indexOf(fn)
      if (idx >= 0) this.subscribers.splice(idx, 1)
    }
  }

  unsubscribe(fn: (value: V) => void): void {
    const idx = this.subscribers.indexOf(fn)
    if (idx >= 0) this.subscribers.splice(idx, 1)
  }

  clear(): void {
    this.subscribers = []
  }

  toString(): string {
    return JSON.stringify({ value: this._value, version: this._version, subscribers: this.subscribers.length })
  }

  toJSON(): Record<string, unknown> {
    return { value: this._value, version: this._version, subscribers: this.subscribers.length }
  }

  clone(): Subject<V> {
    const copy = new Subject<V>(this._value)
    copy._version = this._version
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Subject)) return false
    return this._value === other._value && this._version === other._version
  }
}
