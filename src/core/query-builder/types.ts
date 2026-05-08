export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'matches'
  | 'exists'
  | 'notExists'

export interface QueryFilter {
  field: string
  operator: Operator
  value: unknown
}

export interface SortClause {
  field: string
  direction: 'asc' | 'desc'
}

export interface GroupClause {
  field: string
  aggregate: 'count' | 'sum' | 'avg' | 'min' | 'max'
}

export interface QueryOptions {
  limit?: number
  offset?: number
}

export interface QueryResult<T> {
  items: T[]
  total: number
  filtered: number
  groups?: Map<string, number>
}
