export class Memoizer {
  private cache = new Map<string, unknown>()

  memoize<T>(fn: (...args: unknown[]) => T): (...args: unknown[]) => T {
    return (...args: unknown[]) => {
      const key = JSON.stringify(args)
      if (this.cache.has(key)) return this.cache.get(key) as T
      const result = fn(...args)
      this.cache.set(key, result)
      return result
    }
  }

  get(key: string): unknown | undefined { return this.cache.get(key) }
  has(key: string): boolean { return this.cache.has(key) }
  delete(key: string): boolean { return this.cache.delete(key) }

  get size(): number { return this.cache.size }
  get isEmpty(): boolean { return this.cache.size === 0 }

  clear(): void { this.cache.clear() }

  toArray(): string[] { return Array.from(this.cache.keys()) }
  toString(): string { return JSON.stringify({ entries: this.cache.size }) }
  toJSON(): Record<string, number> { return { entries: this.cache.size } }

  clone(): Memoizer {
    const c = new Memoizer()
    for (const [k, v] of this.cache) c.cache.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Memoizer)) return false
    return this.size === other.size
  }
}
