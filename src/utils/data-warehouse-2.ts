export type ColumnType2 = 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 'json' | 'binary'
export type AggregationType2 = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct' | 'median' | 'variance'

export interface Dimension2 {
  name: string
  table: string
  column: string
  type: ColumnType2
  hierarchy: string[]
}

export interface Measure2 {
  name: string
  table: string
  column: string
  aggregation: AggregationType2
  format: string
}

export interface FactTable2 {
  name: string
  rows: Record<string, unknown>[]
  dimensions: string[]
  measures: string[]
}

export class DataWarehouse2 {
  private dimensions: Map<string, Dimension2> = new Map()
  private measures: Map<string, Measure2> = new Map()
  private factTables: Map<string, FactTable2> = new Map()
  private dimensionTables: Map<string, Record<string, unknown>[]> = new Map()

  defineDimension(name: string, table: string, column: string, type: ColumnType2, hierarchy: string[] = []): this {
    this.dimensions.set(name, { name, table, column, type, hierarchy })
    return this
  }

  defineMeasure(name: string, table: string, column: string, aggregation: AggregationType2, format = ''): this {
    this.measures.set(name, { name, table, column, aggregation, format })
    return this
  }

  createFactTable(name: string): this {
    this.factTables.set(name, { name, rows: [], dimensions: [], measures: [] })
    return this
  }

  addFactRow(tableName: string, row: Record<string, unknown>): boolean {
    const table = this.factTables.get(tableName)
    if (!table) return false
    table.rows.push(row)
    return true
  }

  linkDimension(tableName: string, dimName: string): boolean {
    const table = this.factTables.get(tableName)
    if (!table || !this.dimensions.has(dimName)) return false
    table.dimensions.push(dimName)
    return true
  }

  linkMeasure(tableName: string, measureName: string): boolean {
    const table = this.factTables.get(tableName)
    if (!table || !this.measures.has(measureName)) return false
    table.measures.push(measureName)
    return true
  }

  loadDimensionData(dimName: string, data: Record<string, unknown>[]): boolean {
    if (!this.dimensions.has(dimName)) return false
    const dim = this.dimensions.get(dimName)!
    this.dimensionTables.set(dim.table, data)
    return true
  }

  getDimension(name: string): Dimension2 | undefined { return this.dimensions.get(name) }
  getMeasure(name: string): Measure2 | undefined { return this.measures.get(name) }
  getFactTable(name: string): FactTable2 | undefined { return this.factTables.get(name) }
  getFactRowCount(tableName: string): number { return this.factTables.get(tableName)?.rows.length ?? 0 }

  query(tableName: string, options: {
    dimensions?: string[]
    measures?: string[]
    filters?: Array<{ column: string; op: string; value: unknown }>
    groupBy?: string[]
    orderBy?: string
    limit?: number
  }): Record<string, unknown>[] {
    const table = this.factTables.get(tableName)
    if (!table) return []

    let rows = [...table.rows]

    if (options.filters) {
      rows = rows.filter(row => options.filters!.every(f => {
        const val = row[f.column]
        switch (f.op) {
          case 'eq': return val === f.value
          case 'ne': return val !== f.value
          case 'gt': return typeof val === 'number' && val > (f.value as number)
          case 'lt': return typeof val === 'number' && val < (f.value as number)
          default: return false
        }
      }))
    }

    if (options.groupBy && options.measures) {
      const groups: Map<string, Record<string, unknown>[]> = new Map()
      rows.forEach(row => {
        const key = options.groupBy!.map(g => String(row[g])).join('|')
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(row)
      })

      const result: Record<string, unknown>[] = []
      groups.forEach((groupRows, key) => {
        const resultRow: Record<string, unknown> = {}
        const keyParts = key.split('|')
        options.groupBy!.forEach((g, i) => { resultRow[g] = keyParts[i] })
        options.measures!.forEach(m => {
          const measure = this.measures.get(m)
          if (measure) {
            const values = groupRows.map(r => Number(r[measure.column])).filter(v => !isNaN(v))
            resultRow[m] = this.aggregate(values, measure.aggregation)
          }
        })
        result.push(resultRow)
      })
      rows = result
    }

    if (options.orderBy) {
      rows.sort((a, b) => {
        const av = a[options.orderBy!]
        const bv = b[options.orderBy!]
        if (typeof av === 'number' && typeof bv === 'number') return bv - av
        return 0
      })
    }

    if (options.limit) rows = rows.slice(0, options.limit)

    return rows
  }

  private aggregate(values: number[], type: AggregationType2): number {
    if (values.length === 0) return 0
    switch (type) {
      case 'sum': return values.reduce((a, b) => a + b, 0)
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length
      case 'count': return values.length
      case 'min': return Math.min(...values)
      case 'max': return Math.max(...values)
      case 'distinct': return new Set(values).size
      case 'median': {
        const sorted = [...values].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
      }
      case 'variance': {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
      }
      default: return 0
    }
  }

  getStats(): { dimensions: number; measures: number; factTables: number; totalRows: number } {
    let totalRows = 0
    this.factTables.forEach(t => { totalRows += t.rows.length })
    return {
      dimensions: this.dimensions.size,
      measures: this.measures.size,
      factTables: this.factTables.size,
      totalRows,
    }
  }

  count(): number { return this.factTables.size }

  toArray(): FactTable2[] { return Array.from(this.factTables.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): DataWarehouse2 {
    const dw = new DataWarehouse2()
    this.dimensions.forEach((d, n) => dw.dimensions.set(n, { ...d, hierarchy: [...d.hierarchy] }))
    this.measures.forEach((m, n) => dw.measures.set(n, { ...m }))
    this.factTables.forEach((t, n) => dw.factTables.set(n, { ...t, rows: [...t.rows], dimensions: [...t.dimensions], measures: [...t.measures] }))
    return dw
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DataWarehouse2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.dimensions.clear()
    this.measures.clear()
    this.factTables.clear()
    this.dimensionTables.clear()
  }
}
