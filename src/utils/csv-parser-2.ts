export interface CsvRow2 {
  [key: string]: string
}

export interface CsvParseOptions2 {
  delimiter?: string
  quote?: string
  escape?: string
  hasHeader?: boolean
  trim?: boolean
}

export class CsvParser2 {
  private options: Required<CsvParseOptions2>

  constructor(options: CsvParseOptions2 = {}) {
    this.options = {
      delimiter: options.delimiter ?? ',',
      quote: options.quote ?? '"',
      escape: options.escape ?? '"',
      hasHeader: options.hasHeader ?? true,
      trim: options.trim ?? false,
    }
  }

  parse(text: string): CsvRow2[] {
    const rows = this.splitRows(text)
    if (rows.length === 0) return []

    let headers: string[]
    let dataRows: string[][]

    if (this.options.hasHeader) {
      headers = rows[0].map(h => this.options.trim ? h.trim() : h)
      dataRows = rows.slice(1)
    } else {
      headers = rows[0].map((_, i) => `col${i}`)
      dataRows = rows
    }

    return dataRows.map(row => {
      const obj: CsvRow2 = {}
      headers.forEach((header, i) => {
        const value = row[i] ?? ''
        obj[header] = this.options.trim ? value.trim() : value
      })
      return obj
    })
  }

  parseToArray(text: string): string[][] {
    return this.splitRows(text)
  }

  parseLine(line: string): string[] {
    return this.splitRow(line)
  }

  private splitRows(text: string): string[][] {
    const lines: string[][] = []
    let current: string[] = []
    let field = ''
    let inQuotes = false
    let i = 0

    while (i < text.length) {
      const char = text[i]

      if (inQuotes) {
        if (char === this.options.quote) {
          if (text[i + 1] === this.options.quote) {
            field += this.options.quote
            i += 2
            continue
          } else {
            inQuotes = false
            i++
            continue
          }
        } else {
          field += char
          i++
          continue
        }
      }

      if (char === this.options.quote) {
        inQuotes = true
        i++
        continue
      }

      if (char === this.options.delimiter) {
        current.push(field)
        field = ''
        i++
        continue
      }

      if (char === '\n') {
        current.push(field)
        lines.push(current)
        current = []
        field = ''
        i++
        continue
      }

      if (char === '\r') {
        i++
        continue
      }

      field += char
      i++
    }

    if (field !== '' || current.length > 0) {
      current.push(field)
      lines.push(current)
    }

    return lines.filter(row => row.length > 0 && !(row.length === 1 && row[0] === ''))
  }

  private splitRow(line: string): string[] {
    return this.splitRows(line)[0] ?? []
  }

  count(text: string): number {
    return this.parse(text).length
  }

  getHeaders(text: string): string[] {
    if (!this.options.hasHeader) return []
    const rows = this.splitRows(text)
    return rows.length > 0 ? rows[0] : []
  }

  setOption<K extends keyof CsvParseOptions2>(key: K, value: CsvParseOptions2[K]): this {
    this.options[key] = value as never
    return this
  }

  toArray(text: string): CsvRow2[] { return this.parse(text) }
  toString(): string { return JSON.stringify(this.options) }
  toJSON(): Record<string, unknown> { return { ...this.options } }
  clone(): CsvParser2 { return new CsvParser2(this.options) }
  equals(other: unknown): boolean {
    if (!(other instanceof CsvParser2)) return false
    return this.options.delimiter === other.options.delimiter
  }
  clear(): void { this.options = { delimiter: ',', quote: '"', escape: '"', hasHeader: true, trim: false } }
}
