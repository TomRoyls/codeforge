export class VersionMap<K, V> {
  private data = new Map<K, Array<{ value: V; version: number }>>()
  private currentVersion = 0

  set(key: K, value: V): number {
    this.currentVersion++
    if (!this.data.has(key)) {
      this.data.set(key, [])
    }
    this.data.get(key)!.push({ value, version: this.currentVersion })
    return this.currentVersion
  }

  get(key: K): V | undefined {
    const history = this.data.get(key)
    if (!history || history.length === 0) return undefined
    return history[history.length - 1]!.value
  }

  getAtVersion(key: K, version: number): V | undefined {
    const history = this.data.get(key)
    if (!history) return undefined
    let result: V | undefined
    for (const entry of history) {
      if (entry.version <= version) {
        result = entry.value
      } else {
        break
      }
    }
    return result
  }

  getHistory(key: K): Array<{ value: V; version: number }> {
    return this.data.get(key)?.map((e) => ({ ...e })) ?? []
  }

  has(key: K): boolean {
    return this.data.has(key) && this.data.get(key)!.length > 0
  }

  delete(key: K): boolean {
    return this.data.delete(key)
  }

  get size(): number {
    return this.data.size
  }

  get version(): number {
    return this.currentVersion
  }

  get keys(): K[] {
    return Array.from(this.data.keys())
  }

  revert(key: K, steps = 1): boolean {
    const history = this.data.get(key)
    if (!history || history.length === 0) return false
    for (let i = 0; i < steps && history.length > 1; i++) {
      history.pop()
    }
    return true
  }

  clear(): void {
    this.data.clear()
    this.currentVersion = 0
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key] of this.data) {
      const val = this.get(key)
      if (val !== undefined) result.push([key, val])
    }
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[K, V]> {
    return this.toArray()
  }

  clone(): VersionMap<K, V> {
    const copy = new VersionMap<K, V>()
    for (const [key, history] of this.data) {
      copy.data.set(key, history.map((e) => ({ ...e })))
    }
    copy.currentVersion = this.currentVersion
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof VersionMap)) return false
    if (this.size !== other.size) return false
    if (this.currentVersion !== other.currentVersion) return false
    return true
  }
}
