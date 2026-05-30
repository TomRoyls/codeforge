export class LRUCache3<V> {
  private readonly _data: Map<string, { value: V; expiresAt: number }>
  private readonly _ttlMs: number | undefined

  constructor(
    private readonly _options: { maxSize: number; ttlMs?: number },
  ) {
    this._data = new Map()
    this._ttlMs = _options.ttlMs
  }

  get(key: string): V | undefined {
    const entry = this._data.get(key)
    if (entry === undefined) {
      return undefined
    }

    if (this._isExpired(entry)) {
      this._data.delete(key)
      return undefined
    }

    this._updateRecency(key, entry)
    return entry.value
  }

  set(key: string, value: V): void {
    const expiresAt = this._ttlMs ? Date.now() + this._ttlMs : Infinity

    if (this._data.has(key)) {
      const existingEntry = this._data.get(key)!
      existingEntry.value = value
      existingEntry.expiresAt = expiresAt
      this._updateRecency(key, existingEntry)
      return
    }

    this._evictIfNeeded()
    this._data.set(key, { value, expiresAt })
  }

  has(key: string): boolean {
    const entry = this._data.get(key)
    if (entry === undefined) {
      return false
    }

    if (this._isExpired(entry)) {
      this._data.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this._data.delete(key)
  }

  peek(key: string): V | undefined {
    const entry = this._data.get(key)
    if (entry === undefined) {
      return undefined
    }

    if (this._isExpired(entry)) {
      this._data.delete(key)
      return undefined
    }

    return entry.value
  }

  get size(): number {
    return this._data.size
  }

  get maxSize(): number {
    return this._options.maxSize
  }

  clear(): void {
    this._data.clear()
  }

  keys(): string[] {
    return Array.from(this._data.keys())
  }

  values(): V[] {
    const entries = Array.from(this._data.values())
    return entries.map((entry) => entry.value)
  }

  entries(): Array<[string, V]> {
    const result: Array<[string, V]> = []
    for (const [key, entry] of this._data.entries()) {
      result.push([key, entry.value])
    }
    return result
  }

  purgeExpired(): number {
    let removed = 0
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, entry] of this._data.entries()) {
      if (entry.expiresAt !== Infinity && entry.expiresAt < now) {
        toDelete.push(key)
      }
    }

    for (const key of toDelete) {
      this._data.delete(key)
      removed++
    }

    return removed
  }

  private _isExpired(entry: { expiresAt: number }): boolean {
    return entry.expiresAt !== Infinity && entry.expiresAt < Date.now()
  }

  private _updateRecency(key: string, entry: { value: V; expiresAt: number }): void {
    this._data.delete(key)
    this._data.set(key, entry)
  }

  private _evictIfNeeded(): void {
    if (this._data.size < this._options.maxSize) {
      return
    }

    const oldestKey = this._data.keys().next().value
    if (oldestKey !== undefined) {
      this._data.delete(oldestKey)
    }
  }
}