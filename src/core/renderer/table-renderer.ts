import type { TableColumn, TableRow, TableConfig } from './types.js'

export class TableRenderer {
  render(rows: TableRow[], config: TableConfig): string {
    let sortedRows = rows
    if (config.sortBy) {
      sortedRows = this.sortRows(rows, config.sortBy.key, config.sortBy.direction)
    }

    const widths = this.calculateWidths(config.columns, sortedRows, config.maxWidth)
    const lines: string[] = []

    if (config.showHeader) {
      lines.push(this.renderHeader(config.columns, config.showBorders, widths))
      if (config.showBorders) {
        lines.push(this.renderSeparator(config.columns, widths))
      }
    }

    for (let i = 0; i < sortedRows.length; i++) {
      const row = sortedRows[i]!
      let line = this.renderRow(row, config.columns, config.showBorders, widths)
      if (config.showRowNumbers) {
        const numStr = String(i + 1)
        const padded = numStr.padStart(3)
        line = config.showBorders ? `│ ${padded} │${line}` : `${padded}  ${line}`
      }
      lines.push(line)
    }

    return lines.join('\n')
  }

  renderHeader(columns: TableColumn[], borders: boolean, widths?: number[]): string {
    const w = widths ?? columns.map((c) => c.width ?? c.header.length + 2)
    const cells = columns.map((col, i) => {
      const width = w[i]!
      return this.pad(col.header, width, 'center')
    })

    if (borders) {
      return '│ ' + cells.join(' │ ') + ' │'
    }
    return cells.join('  ')
  }

  renderRow(row: TableRow, columns: TableColumn[], borders: boolean, widths?: number[]): string {
    const w = widths ?? columns.map((c) => c.width ?? c.header.length + 2)
    const cells = columns.map((col, i) => {
      const raw = row[col.key]
      const value = col.format ? col.format(raw) : String(raw ?? '')
      const width = w[i]!
      const truncated = this.truncate(value, width)
      return this.pad(truncated, width, col.align)
    })

    if (borders) {
      return ' ' + cells.join(' │ ') + ' │'
    }
    return cells.join('  ')
  }

  renderSeparator(columns: TableColumn[], widths?: number[]): string {
    const w = widths ?? columns.map((c) => c.width ?? c.header.length + 2)
    const parts = w.map((width) => '─'.repeat(width))
    return '├' + parts.join('┼') + '┤'
  }

  calculateWidths(columns: TableColumn[], rows: TableRow[], maxWidth: number): number[] {
    const widths = columns.map((col) => {
      if (col.width) return col.width

      let maxLen = col.header.length
      for (const row of rows) {
        const raw = row[col.key]
        const value = col.format ? col.format(raw) : String(raw ?? '')
        if (value.length > maxLen) {
          maxLen = value.length
        }
      }
      return maxLen
    })

    if (columns.length === 0) return widths

    const bordersOverhead = 2 + (columns.length - 1) * 3 + 2
    let totalWidth = bordersOverhead + widths.reduce((sum, w) => sum + w, 0)

    if (totalWidth <= maxWidth) return widths

    const available = maxWidth - bordersOverhead
    const equalWidth = Math.floor(available / columns.length)
    return widths.map(() => Math.max(equalWidth, 1))
  }

  truncate(text: string, width: number): string {
    if (text.length <= width) return text
    if (width < 3) return text.slice(0, width)
    return text.slice(0, width - 3) + '...'
  }

  pad(text: string, width: number, align: TableColumn['align']): string {
    if (text.length >= width) return text.slice(0, width)
    const space = width - text.length
    switch (align) {
      case 'left':
        return text + ' '.repeat(space)
      case 'right':
        return ' '.repeat(space) + text
      case 'center': {
        const left = Math.floor(space / 2)
        const right = space - left
        return ' '.repeat(left) + text + ' '.repeat(right)
      }
    }
  }

  sortRows(rows: TableRow[], key: string, direction: 'asc' | 'desc'): TableRow[] {
    const sorted = [...rows]
    sorted.sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        const aStr = String(aVal ?? '')
        const bStr = String(bVal ?? '')
        cmp = aStr.localeCompare(bStr)
      }
      return direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }
}
