export type JsonQueryOp2 = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin' | '$regex' | '$exists'

export interface JsonQueryCondition2 {
  field: string
  op: JsonQueryOp2
  value: unknown
}

export class JsonQuery2<T = unknown> {
  private data: T[] = []
  private conditions: JsonQueryCondition2[] = []

  from(data: T[]): this {
    this.data = [...data]
    return this
  }

  where(field: string, op: JsonQueryOp2, value: unknown): this {
    this.conditions.push({ field, op, value })
    return this
  }

  whereEq(field: string, value: unknown): this {
    return this.where(field, '$eq', value)
  }

  whereGt(field: string, value: number): this {
    return this.where(field, '$gt', value)
  }

  whereLt(field: string, value: number): this {
    return this.where(field, '$lt', value)
  }

  whereIn(field: string, values: unknown[]): this {
    return this.where(field, '$in', values)
  }

  whereExists(field: string, exists: boolean = true): this {
    return this.where(field, '$exists', exists)
  }

  whereRegex(field: string, pattern: RegExp): this {
    return this.where(field, '$regex', pattern)
  }

  select(): T[] {
    return this.data.filter(item => this.matches(item))
  }

  selectOne(): T | undefined {
    return this.data.find(item => this.matches(item))
  }

  count(): number {
    return this.select().length
  }

  selectFields<K extends keyof T>(...fields: K[]): Pick<T, K>[] {
    return this.select().map(item => {
      const result: Partial<T> = {}
      for (const field of fields) {
        result[field] = item[field]
      }
      return result as Pick<T, K>
    })
  }

  orderBy<K extends keyof T>(field: K, descending = false): T[] {
    const results = this.select()
    return results.sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (av === bv) return 0
      const cmp = av < bv ? -1 : 1
      return descending ? -cmp : cmp
    })
  }

  groupBy<K extends keyof T>(field: K): Map<T[K], T[]> {
    const groups = new Map<T[K], T[]>()
    for (const item of this.select()) {
      const key = item[field]
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  distinct<K extends keyof T>(field: K): T[K][] {
    const values = new Set<T[K]>()
    for (const item of this.select()) {
      values.add(item[field])
    }
    return Array.from(values)
  }

  private matches(item: T): boolean {
    return this.conditions.every(cond => {
      const value = this.getField(item, cond.field)

      switch (cond.op) {
        case '$eq': return value === cond.value
        case '$ne': return value !== cond.value
        case '$gt': return typeof value === 'number' && value > (cond.value as number)
        case '$gte': return typeof value === 'number' && value >= (cond.value as number)
        case '$lt': return typeof value === 'number' && value < (cond.value as number)
        case '$lte': return typeof value === 'number' && value <= (cond.value as number)
        case '$in': return Array.isArray(cond.value) && cond.value.includes(value)
        case '$nin': return Array.isArray(cond.value) && !cond.value.includes(value)
        case '$exists': return cond.value ? value !== undefined : value === undefined
        case '$regex': return typeof value === 'string' && (cond.value as RegExp).test(value)
        default: return false
      }
    })
  }

  private getField(item: T, field: string): unknown {
    const parts = field.split('.')
    let current: unknown = item
    for (const part of parts) {
      if (typeof current !== 'object' || current === null) return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  getData(): T[] { return [...this.data] }
  getConditions(): JsonQueryCondition2[] { return [...this.conditions] }

  reset(): this {
    this.conditions = []
    return this
  }

  clear(): void {
    this.data = []
    this.conditions = []
  }

  toArray(): T[] { return this.select() }
  toString(): string { return JSON.stringify({ data: this.data.length, conditions: this.conditions.length }) }
  toJSON(): Record<string, unknown> { return { data: this.data.length, conditions: this.conditions.length } }
  clone(): JsonQuery2<T> {
    const jq = new JsonQuery2<T>()
    jq.data = [...this.data]
    jq.conditions = [...this.conditions]
    return jq
  }
  equals(other: unknown): boolean {
    if (!(other instanceof JsonQuery2)) return false
    return this.data.length === other.data.length
  }
}
