import type { QueryFilter, Operator, SortClause, GroupClause, QueryOptions, QueryResult } from './types.js'
import { FilterEngine } from './filter-engine.js'

export class QueryBuilder<T extends Record<string, unknown>> {
  private data: T[]
  private filters: QueryFilter[] = []
  private orFilterGroups: QueryFilter[] = []
  private sorts: SortClause[] = []
  private groupClause: GroupClause | undefined
  private options: QueryOptions = {}

  constructor(data: T[]) {
    this.data = data
  }

  where(field: string, operator: Operator, value: unknown): this {
    this.filters.push({ field, operator, value })
    return this
  }

  andWhere(field: string, operator: Operator, value: unknown): this {
    return this.where(field, operator, value)
  }

  orWhere(field: string, operator: Operator, value: unknown): this {
    this.orFilterGroups.push({ field, operator, value })
    return this
  }

  orderBy(field: string, direction: 'asc' | 'desc'): this {
    this.sorts.push({ field, direction })
    return this
  }

  groupBy(field: string, aggregate: GroupClause['aggregate']): this {
    this.groupClause = { field, aggregate }
    return this
  }

  limit(n: number): this {
    this.options = { ...this.options, limit: n }
    return this
  }

  offset(n: number): this {
    this.options = { ...this.options, offset: n }
    return this
  }

  execute(): QueryResult<T> {
    const engine = new FilterEngine()
    const filtered = this.applyFilters(engine)
    const total = this.data.length
    const filteredCount = filtered.length
    const sorted = engine.sort(filtered, this.sorts)

    let groups: Map<string, number> | undefined
    if (this.groupClause) {
      groups = engine.group(sorted, this.groupClause)
    }

    const paginated = engine.paginate(sorted, this.options)

    return {
      items: paginated,
      total,
      filtered: filteredCount,
      groups,
    }
  }

  count(): number {
    const engine = new FilterEngine()
    return this.applyFilters(engine).length
  }

  first(): T | undefined {
    const result = this.execute()
    return result.items[0]
  }

  reset(): this {
    this.filters = []
    this.orFilterGroups = []
    this.sorts = []
    this.groupClause = undefined
    this.options = {}
    return this
  }

  private applyFilters(engine: FilterEngine): T[] {
    if (this.filters.length === 0 && this.orFilterGroups.length === 0) {
      return [...this.data]
    }

    if (this.filters.length === 0 && this.orFilterGroups.length > 0) {
      return this.data.filter(item =>
        this.orFilterGroups.some(orFilter => engine.evaluate(item, orFilter))
      )
    }

    const andResults = engine.evaluateAll(this.data, this.filters)

    if (this.orFilterGroups.length === 0) {
      return andResults
    }

    const orResults = this.data.filter(item =>
      this.orFilterGroups.some(orFilter => engine.evaluate(item, orFilter))
    )
    const existingSet = new Set<T>(andResults)
    for (const match of orResults) {
      if (!existingSet.has(match)) {
        andResults.push(match)
      }
    }
    return andResults
  }
}
