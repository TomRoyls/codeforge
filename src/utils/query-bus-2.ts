export interface Query2 {
  type: string
  params: Record<string, unknown>
}

export interface QueryResult2<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type QueryExecutor2<T = unknown> = (query: Query2) => QueryResult2<T> | Promise<QueryResult2<T>>

export class QueryBus2 {
  private executors: Map<string, QueryExecutor2> = new Map()
  private cache: Map<string, { result: QueryResult2; timestamp: number }> = new Map()
  private cacheTTL: number = 0

  register(type: string, executor: QueryExecutor2): this {
    this.executors.set(type, executor)
    return this
  }

  unregister(type: string): boolean {
    return this.executors.delete(type)
  }

  hasExecutor(type: string): boolean {
    return this.executors.has(type)
  }

  setCacheTTL(ms: number): this {
    this.cacheTTL = ms
    return this
  }

  async execute<T = unknown>(query: Query2): Promise<QueryResult2<T>> {
    const cacheKey = this.makeCacheKey(query)
    if (this.cacheTTL > 0 && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.result as QueryResult2<T>
      }
      this.cache.delete(cacheKey)
    }

    const executor = this.executors.get(query.type)
    if (!executor) return { success: false, error: `No executor for: ${query.type}` }

    try {
      const result = await executor(query) as QueryResult2<T>
      if (this.cacheTTL > 0 && result.success) {
        this.cache.set(cacheKey, { result: result as QueryResult2, timestamp: Date.now() })
      }
      return result
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  registeredTypes(): string[] {
    return Array.from(this.executors.keys())
  }

  count(): number { return this.executors.size }

  clear(): void {
    this.executors.clear()
    this.cache.clear()
  }

  private makeCacheKey(query: Query2): string {
    return `${query.type}:${JSON.stringify(query.params)}`
  }

  toArray(): string[] { return this.registeredTypes() }
  toString(): string { return JSON.stringify({ executors: this.count(), cacheSize: this.cache.size }) }
  toJSON(): Record<string, unknown> { return { executors: this.count(), cacheSize: this.cache.size, types: this.registeredTypes() } }
  clone(): QueryBus2 {
    const qb = new QueryBus2()
    qb.cacheTTL = this.cacheTTL
    this.executors.forEach((e, t) => qb.register(t, e))
    return qb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof QueryBus2)) return false
    return this.count() === other.count()
  }
}
