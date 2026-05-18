import type { QueryFilter, SortClause, GroupClause, QueryOptions } from './types.js'

const filterRegexCache = new Map<string, RegExp>()

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
        let regex = filterRegexCache.get(filter.value)
        if (!regex) {
          regex = new RegExp(filter.value)
          filterRegexCache.set(filter.value, regex)
        }
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
        case 'sum': {
          let s = 0
          for (let i = 0; i < data.numericValues.length; i++) s += data.numericValues[i]!
          result.set(key, s)
          break
        }
        case 'avg': {
          if (data.numericValues.length === 0) { result.set(key, 0); break }
          let avgS = 0
          for (let i = 0; i < data.numericValues.length; i++) avgS += data.numericValues[i]!
          result.set(key, avgS / data.numericValues.length)
          break
        }
        case 'min': {
          if (data.numericValues.length === 0) { result.set(key, 0); break }
          let mn = data.numericValues[0]!
          for (let i = 1; i < data.numericValues.length; i++) {
            if (data.numericValues[i]! < mn) mn = data.numericValues[i]!
          }
          result.set(key, mn)
          break
        }
        case 'max': {
          if (data.numericValues.length === 0) { result.set(key, 0); break }
          let mx = data.numericValues[0]!
          for (let i = 1; i < data.numericValues.length; i++) {
            if (data.numericValues[i]! > mx) mx = data.numericValues[i]!
          }
          result.set(key, mx)
          break
        }
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
