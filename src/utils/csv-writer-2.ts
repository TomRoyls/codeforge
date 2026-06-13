import { CsvRow2 } from './csv-parser-2.js'

export interface CsvWriteOptions2 {
  delimiter?: string
  quote?: string
  hasHeader?: boolean
}

export class CsvWriter2 {
  private options: Required<CsvWriteOptions2>
  private headers: string[] = []
  private rows: CsvRow2[] = []

  constructor(options: CsvWriteOptions2 = {}) {
    this.options = {
      delimiter: options.delimiter ?? ',',
      quote: options.quote ?? '"',
      hasHeader: options.hasHeader ?? true,
    }
  }

  setHeaders(headers: string[]): this {
    this.headers = [...headers]
    return this
  }

  getHeaders(): string[] {
    return [...this.headers]
  }

  addRow(row: CsvRow2): this {
    this.rows.push(row)
    if (this.headers.length === 0) {
      this.headers = Object.keys(row)
    }
    return this
  }

  addRows(rows: CsvRow2[]): this {
    rows.forEach(r => this.addRow(r))
    return this
  }

  private escapeField(value: string): string {
    if (value.includes(this.options.delimiter) || value.includes(this.options.quote) || value.includes('\n')) {
      const escaped = value.replace(new RegExp(this.options.quote, 'g'), this.options.quote + this.options.quote)
      return `${this.options.quote}${escaped}${this.options.quote}`
    }
    return value
  }

  build(): string {
    const lines: string[] = []

    if (this.options.hasHeader && this.headers.length > 0) {
      lines.push(this.headers.map(h => this.escapeField(h)).join(this.options.delimiter))
    }

    for (const row of this.rows) {
      const fields = this.headers.map(h => this.escapeField(String(row[h] ?? '')))
      lines.push(fields.join(this.options.delimiter))
    }

    return lines.join('\n')
  }

  buildRow(row: CsvRow2): string {
    const fields = (this.headers.length > 0 ? this.headers : Object.keys(row))
      .map(h => this.escapeField(String(row[h] ?? '')))
    return fields.join(this.options.delimiter)
  }

  count(): number { return this.rows.length }

  clear(): void {
    this.rows = []
    this.headers = []
  }

  clearRows(): void {
    this.rows = []
  }

  toArray(): CsvRow2[] { return [...this.rows] }
  toString(): string { return this.build() }
  toJSON(): Record<string, unknown> { return { headers: this.headers, rowCount: this.count() } }
  clone(): CsvWriter2 {
    const cw = new CsvWriter2(this.options)
    cw.headers = [...this.headers]
    cw.rows = [...this.rows]
    return cw
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CsvWriter2)) return false
    return this.count() === other.count()
  }
}
