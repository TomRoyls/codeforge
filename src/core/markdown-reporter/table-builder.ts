import type { MarkdownTableConfig } from './types.js'

type Alignment = 'left' | 'center' | 'right'

export class TableBuilder {
  private headers: string[] = []
  private rows: string[][] = []
  private alignment: Alignment[] = []

  setHeaders(headers: string[], alignment?: Alignment[]): void {
    this.headers = headers
    this.alignment = alignment ?? headers.map(() => 'left')
  }

  addRow(cells: string[]): void {
    this.rows.push(cells)
  }

  addRows(rows: string[][]): void {
    for (const row of rows) {
      this.rows.push(row)
    }
  }

  build(): string {
    if (this.headers.length === 0) {
      return ''
    }

    const headerLine = '| ' + this.headers.join(' | ') + ' |'
    const separatorParts = this.headers.map((_header, i) => {
      const align = this.alignment[i] ?? 'left'
      switch (align) {
        case 'left':
          return ':---'
        case 'center':
          return ':---:'
        case 'right':
          return '---:'
      }
    })
    const separatorLine = '| ' + separatorParts.join(' | ') + ' |'

    const dataLines = this.rows.map((row) => {
      const padded = this.headers.map((_h, i) => {
        const cell = row[i] ?? ''
        return cell
      })
      return '| ' + padded.join(' | ') + ' |'
    })

    return [headerLine, separatorLine, ...dataLines].join('\n')
  }

  reset(): void {
    this.headers = []
    this.rows = []
    this.alignment = []
  }

  static fromConfig(config: MarkdownTableConfig): string {
    const builder = new TableBuilder()
    builder.setHeaders(config.headers, config.alignment)
    builder.addRows(config.rows)
    return builder.build()
  }
}
