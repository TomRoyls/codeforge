import type { ColumnConfig, TableConfig } from './types.js'
import { TableFormatter } from './table-formatter.js'

const DEFAULT_TABLE_CONFIG: TableConfig = {
  borderStyle: 'single',
  showHeader: true,
  showRowSeparator: false,
  padding: 1,
  truncate: true,
}

export class CliTable {
  private columns: ColumnConfig[]
  private config: TableConfig
  private rows: string[][]

  constructor(columns?: ColumnConfig[], config?: Partial<TableConfig>) {
    this.columns = columns ?? []
    this.config = { ...DEFAULT_TABLE_CONFIG, ...config }
    this.rows = []
  }

  setColumns(columns: ColumnConfig[]): void {
    this.columns = columns
  }

  addRow(cells: string[]): void {
    this.rows.push(cells)
  }

  addRows(rows: string[][]): void {
    for (const row of rows) {
      this.rows.push(row)
    }
  }

  setConfig(config: Partial<TableConfig>): void {
    this.config = { ...this.config, ...config }
  }

  render(): string {
    const formatter = new TableFormatter()
    const border = TableFormatter.getBorderChars(this.config.borderStyle)

    if (this.columns.length === 0) return ''

    const headers = this.columns.map((c) => c.header)
    const effectiveColumns = this.config.truncate
      ? this.columns
      : this.columns.map((c) => ({ ...c, maxWidth: Infinity }))
    const widths = formatter.measureWidths(headers, this.rows, effectiveColumns)

    const lines: string[] = []

    const topSep = formatter.formatSeparator(
      {
        ...border,
        midLeft: border.topLeft,
        midRight: border.topRight,
        midMid: border.topMid,
        midHorizontal: border.topHorizontal,
      },
      widths,
      this.config.padding,
    )
    if (topSep !== '') lines.push(topSep)

    if (this.config.showHeader) {
      const headerCells = headers.map((header, i) => {
        const col = this.columns[i]!
        const text = this.config.truncate ? formatter.truncate(header, widths[i]!) : header
        return formatter.formatCell(text, widths[i]!, col.alignment ?? 'left', this.config.padding)
      })
      lines.push(formatter.formatRow(headerCells, border))

      const headerSep = formatter.formatSeparator(border, widths, this.config.padding)
      if (headerSep !== '') lines.push(headerSep)
    }

    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r]!
      const cells = widths.map((w, i) => {
        const col = this.columns[i]
        const raw = row[i] ?? ''
        const text = this.config.truncate ? formatter.truncate(raw, w) : raw
        const alignment = col?.alignment ?? 'left'
        return formatter.formatCell(text, w, alignment, this.config.padding)
      })
      lines.push(formatter.formatRow(cells, border))

      if (this.config.showRowSeparator && r < this.rows.length - 1) {
        const rowSep = formatter.formatSeparator(border, widths, this.config.padding)
        if (rowSep !== '') lines.push(rowSep)
      }
    }

    const bottomSep = formatter.formatSeparator(
      {
        ...border,
        midLeft: border.bottomLeft,
        midRight: border.bottomRight,
        midMid: border.bottomMid,
        midHorizontal: border.bottomHorizontal,
      },
      widths,
      this.config.padding,
    )
    if (bottomSep !== '') lines.push(bottomSep)

    return lines.join('\n')
  }

  getRowCount(): number {
    return this.rows.length
  }

  getColumnCount(): number {
    return this.columns.length
  }

  clear(): void {
    this.rows = []
  }

  toString(): string {
    return this.render()
  }
}
