export type QueryType2 = 'select' | 'insert' | 'update' | 'delete' | 'create' | 'drop' | 'alter'

export interface QueryClause2 {
  type: 'where' | 'order' | 'group' | 'having' | 'limit' | 'offset' | 'join'
  content: string
}

export class QueryBuilder2 {
  private queryType: QueryType2 = 'select'
  private table: string = ''
  private columns: string[] = []
  private clauses: QueryClause2[] = []
  private values: Record<string, unknown>[] = []
  private parameters: unknown[] = []
  private distinct: boolean = false

  select(...columns: string[]): this {
    this.queryType = 'select'
    this.columns = columns.length > 0 ? columns : ['*']
    return this
  }

  from(table: string): this {
    this.table = table
    return this
  }

  insertInto(table: string): this {
    this.queryType = 'insert'
    this.table = table
    return this
  }

  update(table: string): this {
    this.queryType = 'update'
    this.table = table
    return this
  }

  deleteFrom(table: string): this {
    this.queryType = 'delete'
    this.table = table
    return this
  }

  setDistinct(enabled: boolean): this { this.distinct = enabled; return this }

  where(condition: string): this {
    this.clauses.push({ type: 'where', content: condition })
    return this
  }

  join(table: string, on: string, type = 'INNER'): this {
    this.clauses.push({ type: 'join', content: `${type} JOIN ${table} ON ${on}` })
    return this
  }

  groupBy(...columns: string[]): this {
    this.clauses.push({ type: 'group', content: columns.join(', ') })
    return this
  }

  having(condition: string): this {
    this.clauses.push({ type: 'having', content: condition })
    return this
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.clauses.push({ type: 'order', content: `${column} ${direction}` })
    return this
  }

  limit(count: number): this {
    this.clauses.push({ type: 'limit', content: String(count) })
    return this
  }

  offset(count: number): this {
    this.clauses.push({ type: 'offset', content: String(count) })
    return this
  }

  addValue(value: Record<string, unknown>): this {
    this.values.push(value)
    return this
  }

  addParameter(value: unknown): this {
    this.parameters.push(value)
    return this
  }

  build(): string {
    let sql = ''
    switch (this.queryType) {
      case 'select':
        sql = `SELECT ${this.distinct ? 'DISTINCT ' : ''}${this.columns.join(', ')} FROM ${this.table}`
        break
      case 'insert':
        sql = `INSERT INTO ${this.table}`
        if (this.values.length > 0) {
          const cols = Object.keys(this.values[0])
          const placeholders = this.values.map(v => `(${cols.map(() => '?').join(', ')})`).join(', ')
          sql += ` (${cols.join(', ')}) VALUES ${placeholders}`
        }
        break
      case 'update':
        sql = `UPDATE ${this.table} SET `
        if (this.values.length > 0) {
          const cols = Object.keys(this.values[0])
          sql += cols.map(c => `${c} = ?`).join(', ')
        }
        break
      case 'delete':
        sql = `DELETE FROM ${this.table}`
        break
      default:
        sql = `${this.queryType.toUpperCase()} ${this.table}`
    }
    const joins = this.clauses.filter(c => c.type === 'join').map(c => ` ${c.content}`)
    const wheres = this.clauses.filter(c => c.type === 'where').map(c => c.content)
    const groups = this.clauses.filter(c => c.type === 'group').map(c => c.content)
    const havings = this.clauses.filter(c => c.type === 'having').map(c => c.content)
    const orders = this.clauses.filter(c => c.type === 'order').map(c => c.content)
    const limits = this.clauses.filter(c => c.type === 'limit').map(c => c.content)
    const offsets = this.clauses.filter(c => c.type === 'offset').map(c => c.content)

    if (joins.length > 0) sql += joins.join('')
    if (wheres.length > 0) sql += ` WHERE ${wheres.join(' AND ')}`
    if (groups.length > 0) sql += ` GROUP BY ${groups.join(', ')}`
    if (havings.length > 0) sql += ` HAVING ${havings.join(' AND ')}`
    if (orders.length > 0) sql += ` ORDER BY ${orders.join(', ')}`
    if (limits.length > 0) sql += ` LIMIT ${limits[0]}`
    if (offsets.length > 0) sql += ` OFFSET ${offsets[0]}`

    return sql
  }

  getParameters(): unknown[] {
    const params: unknown[] = []
    if (this.queryType === 'insert') {
      this.values.forEach(v => Object.values(v).forEach(val => params.push(val)))
    } else if (this.queryType === 'update') {
      if (this.values.length > 0) Object.values(this.values[0]).forEach(val => params.push(val))
    }
    params.push(...this.parameters)
    return params
  }

  getQueryType(): QueryType2 { return this.queryType }
  getTable(): string { return this.table }
  getClauses(): QueryClause2[] { return [...this.clauses] }
  getColumns(): string[] { return [...this.columns] }

  reset(): this {
    this.queryType = 'select'
    this.table = ''
    this.columns = []
    this.clauses = []
    this.values = []
    this.parameters = []
    this.distinct = false
    return this
  }

  count(): number { return this.clauses.length }

  toString(): string { return this.build() }
  toJSON(): Record<string, unknown> {
    return { query: this.build(), type: this.queryType, table: this.table, parameters: this.getParameters().length }
  }
  clone(): QueryBuilder2 {
    const qb = new QueryBuilder2()
    qb.queryType = this.queryType
    qb.table = this.table
    qb.columns = [...this.columns]
    qb.clauses = [...this.clauses]
    qb.values = [...this.values]
    qb.parameters = [...this.parameters]
    qb.distinct = this.distinct
    return qb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof QueryBuilder2)) return false
    return this.build() === other.build()
  }
  clear(): void { this.reset() }
}
