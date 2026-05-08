import type { QueryFilter, SortClause, GroupClause, QueryOptions } from './types.js'

export class FilterEngine {
  evaluate(item: Record<string, unknown>, filter: QueryFilter): boolean {
    const itemValue = item[filter.field]

    switch (filter.operator) {
      case 'eq':
        return itemValue === filter.value
      case 'neq':
        return itemValue !== filter.value
      case 'gt':
        return typeof itemValue === 'number' && typeof filter.value === 'number' && itemValue > filter.value
      case 'gte':
        return typeof itemValue === 'number' && typeof filter.value === 'number' && itemValue >= filter.value
      case 'lt':
        return typeof itemValue === 'number' && typeof filter.value === 'number' && itemValue < filter.value
      case 'lte':
        return typeof itemValue === 'number' && typeof filter.value === 'number' && itemValue <= filter.value
      case 'contains':
        return typeof itemValue === 'string' && typeof filter.value === 'string' && itemValue.includes(filter.value)
      case 'startsWith':
        return typeof itemValue === 'string' && typeof filter.value === 'string' && itemValue.startsWith(filter.value)
      case 'endsWith':
        return typeof itemValue === 'string' && typeof filter.value === 'string' && itemValue.endsWith(filter.value)
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(itemValue)
      case 'notIn':
        return Array.isArray(filter.value) && !filter.value.includes(itemValue)
      case 'matches': {
        if (typeof filter.value !== 'string') return false
        const regex = new RegExp(filter.value)
        return typeof itemValue === 'string' && regex.test(itemValue)
      }
      case 'exists':
        return itemValue !== undefined
      case 'notExists':
        return itemValue === undefined
    }
  }

  evaluateAll<T extends Record<string, unknown>>(items: T[], filters: QueryFilter[]): T[] {
    if (filters.length === 0) return [...items]
    return items.filter(item => filters.every(filter => this.evaluate(item, filter)))
  }

  sort<T extends Record<string, unknown>>(items: T[], sorts: SortClause[]): T[] {
    if (sorts.length === 0) return [...items]
    return [...items].sort((a, b) => {
      for (const clause of sorts) {
        const aVal = a[clause.field]
        const bVal = b[clause.field]
        let cmp = 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal
        }
        if (cmp !== 0) {
          return clause.direction === 'desc' ? -cmp : cmp
        }
      }
      return 0
    })
  }

  group<T extends Record<string, unknown>>(items: T[], clause: GroupClause): Map<string, number> {
    const groups = new Map<string, { count: number; numericValues: number[] }>()

    for (const item of items) {
      const keyValue = item[clause.field]
      const key = String(keyValue ?? '')
      const group = groups.get(key) ?? { count: 0, numericValues: [] }
      group.count++
      if (typeof keyValue === 'number') {
        group.numericValues.push(keyValue)
      }
      groups.set(key, group)
    }

    const result = new Map<string, number>()
    for (const [key, data] of groups) {
      switch (clause.aggregate) {
        case 'count':
          result.set(key, data.count)
          break
        case 'sum':
          result.set(key, data.numericValues.reduce((a, b) => a + b, 0))
          break
        case 'avg':
          result.set(key, data.numericValues.length > 0 ? data.numericValues.reduce((a, b) => a + b, 0) / data.numericValues.length : 0)
          break
        case 'min':
          result.set(key, data.numericValues.length > 0 ? Math.min(...data.numericValues) : 0)
          break
        case 'max':
          result.set(key, data.numericValues.length > 0 ? Math.max(...data.numericValues) : 0)
          break
      }
    }

    return result
  }

  paginate<T extends Record<string, unknown>>(items: T[], options: QueryOptions): T[] {
    const offset = options.offset ?? 0
    if (options.limit !== undefined) {
      return items.slice(offset, offset + options.limit)
    }
    return items.slice(offset)
  }
}
