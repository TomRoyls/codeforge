import type {
  RenderOptions,
  RenderTheme,
  Renderable,
  TableData,
  ListData,
} from './types.js'
import { clamp } from '../../utils/math-helpers.js'

const DEFAULT_THEME: RenderTheme = {
  success: '',
  error: '',
  warning: '',
  info: '',
  highlight: '',
  dim: '',
  bold: '',
  reset: '',
}

const DEFAULT_OPTIONS: RenderOptions = {
  format: 'text',
  theme: DEFAULT_THEME,
  color: true,
  indent: 2,
  maxWidth: 80,
}

export class OutputRenderer {
  private options: RenderOptions
  private buffer: Renderable[]

  constructor(options?: Partial<RenderOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    if (options?.theme) {
      this.options.theme = { ...DEFAULT_THEME, ...options.theme }
    }
    this.buffer = []
  }

  heading(text: string, level: number = 1): void {
    this.buffer.push({
      type: 'heading',
      content: text,
      options: { level: clamp(level, 1, 3) },
    })
  }

  text(content: string): void {
    this.buffer.push({
      type: 'text',
      content,
      options: {},
    })
  }

  list(items: string[], options?: { ordered?: boolean; bullet?: string }): void {
    this.buffer.push({
      type: 'list',
      content: { items, ordered: options?.ordered ?? false, bullet: options?.bullet ?? '-' },
      options: {},
    })
  }

  table(
    headers: string[],
    rows: unknown[][],
    alignments?: ('left' | 'right' | 'center')[],
  ): void {
    this.buffer.push({
      type: 'table',
      content: { headers, rows, alignments: alignments ?? [] },
      options: {},
    })
  }

  code(content: string, language?: string): void {
    this.buffer.push({
      type: 'code',
      content,
      options: { language: language ?? '' },
    })
  }

  divider(): void {
    this.buffer.push({
      type: 'divider',
      content: null,
      options: {},
    })
  }

  group(elements: Renderable[]): void {
    this.buffer.push({
      type: 'group',
      content: elements,
      options: {},
    })
  }

  clear(): void {
    this.buffer = []
  }

  getBuffer(): Renderable[] {
    return [...this.buffer]
  }

  render(): string {
    if (this.buffer.length === 0) return ''
    const rendered = this.buffer.map((element) => this.renderElement(element))
    const nonEmpty = rendered.filter((r) => r.length > 0)
    return nonEmpty.join('\n\n')
  }

  renderElement(element: Renderable): string {
    switch (this.options.format) {
      case 'text':
        return this.renderText(element)
      case 'json':
        return this.renderJSON(element)
      case 'table':
        return this.renderTable(element)
      case 'list':
        return this.renderList(element)
      case 'csv':
        return this.renderCSV(element)
      default:
        return this.renderText(element)
    }
  }

  renderText(element: Renderable): string {
    switch (element.type) {
      case 'heading': {
        const level = (element.options['level'] as number) ?? 1
        return '#'.repeat(level) + ' ' + String(element.content)
      }
      case 'text':
        return String(element.content)
      case 'list': {
        const listData = element.content as ListData
        return this.formatList(
          listData.items,
          listData.ordered ? '1.' : listData.bullet,
        )
      }
      case 'table': {
        const tableData = element.content as TableData
        return this.formatTable(
          tableData.headers,
          tableData.rows.map((row) => row.map((cell) => String(cell))),
          tableData.alignments,
        )
      }
      case 'code': {
        const lang = (element.options['language'] as string) ?? ''
        return '```' + lang + '\n' + String(element.content) + '\n```'
      }
      case 'divider':
        return '---'
      case 'group': {
        const elements = element.content as Renderable[]
        const rendered = elements
          .map((e) => this.renderText(e))
          .filter((r) => r.length > 0)
        return rendered.join('\n')
      }
      default:
        return ''
    }
  }

  renderJSON(element: Renderable): string {
    let output: Record<string, unknown>
    switch (element.type) {
      case 'heading':
        output = { type: 'heading', content: element.content, level: element.options['level'] ?? 1 }
        break
      case 'text':
        output = { type: 'text', content: element.content }
        break
      case 'list':
        output = { type: 'list', content: element.content }
        break
      case 'table':
        output = { type: 'table', content: element.content }
        break
      case 'code':
        output = { type: 'code', content: element.content, language: element.options['language'] ?? '' }
        break
      case 'divider':
        output = { type: 'divider' }
        break
      case 'group':
        output = { type: 'group', content: element.content }
        break
      default:
        output = { type: element.type, content: element.content }
    }
    return JSON.stringify(output, null, this.options.indent)
  }

  renderTable(element: Renderable): string {
    if (element.type === 'table') {
      const tableData = element.content as TableData
      return this.formatTable(
        tableData.headers,
        tableData.rows.map((row) => row.map((cell) => String(cell))),
        tableData.alignments,
      )
    }
    if (element.type === 'group') {
      const elements = element.content as Renderable[]
      const rendered = elements
        .map((e) => this.renderTable(e))
        .filter((r) => r.length > 0)
      return rendered.join('\n\n')
    }
    if (element.type === 'divider') return '---'
    if (element.type === 'heading') {
      const level = (element.options['level'] as number) ?? 1
      return '#'.repeat(level) + ' ' + String(element.content)
    }
    return String(element.content ?? '')
  }

  renderList(element: Renderable): string {
    if (element.type === 'list') {
      const listData = element.content as ListData
      return this.formatList(
        listData.items,
        listData.ordered ? '1.' : listData.bullet,
      )
    }
    if (element.type === 'group') {
      const elements = element.content as Renderable[]
      const rendered = elements
        .map((e) => this.renderList(e))
        .filter((r) => r.length > 0)
      return rendered.join('\n\n')
    }
    if (element.type === 'divider') return '---'
    if (element.type === 'heading') {
      const level = (element.options['level'] as number) ?? 1
      return '#'.repeat(level) + ' ' + String(element.content)
    }
    return String(element.content ?? '')
  }

  renderCSV(element: Renderable): string {
    if (element.type === 'table') {
      const tableData = element.content as TableData
      const lines: string[] = []
      lines.push(tableData.headers.map((h) => this.csvEscape(h)).join(','))
      for (const row of tableData.rows) {
        lines.push(row.map((cell) => this.csvEscape(String(cell))).join(','))
      }
      return lines.join('\n')
    }
    if (element.type === 'group') {
      const elements = element.content as Renderable[]
      const rendered = elements
        .map((e) => this.renderCSV(e))
        .filter((r) => r.length > 0)
      return rendered.join('\n\n')
    }
    if (element.type === 'divider') return '---'
    if (element.type === 'heading') {
      const level = (element.options['level'] as number) ?? 1
      return '#'.repeat(level) + ' ' + String(element.content)
    }
    return String(element.content ?? '')
  }

  formatTable(
    headers: string[],
    rows: string[][],
    alignments?: ('left' | 'right' | 'center')[],
  ): string {
    const aligns = alignments ?? []
    const colCount = headers.length
    const widths: number[] = headers.map((h) => h.length)
    for (const row of rows) {
      for (let i = 0; i < colCount; i++) {
        const cellLen = (row[i] ?? '').length
        if (cellLen > (widths[i] ?? 0)) {
          widths[i] = cellLen
        }
      }
    }
    const totalWidth =
      widths.reduce((sum, w) => sum + w, 0) + (colCount - 1) * 3 + 4
    if (totalWidth > this.options.maxWidth) {
      const available = this.options.maxWidth - (colCount - 1) * 3 - 4
      const perCol = Math.max(Math.floor(available / colCount), 1)
      for (let i = 0; i < colCount; i++) {
        if (widths[i]! > perCol) {
          widths[i] = perCol
        }
      }
    }
    const alignCell = (text: string, width: number, index: number): string => {
      const alignment = aligns[index] ?? 'left'
      if (text.length > width) {
        text = text.slice(0, width)
      }
      const pad = width - text.length
      switch (alignment) {
        case 'right':
          return ' '.repeat(pad) + text
        case 'center': {
          const leftPad = Math.floor(pad / 2)
          const rightPad = pad - leftPad
          return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
        }
        default:
          return text + ' '.repeat(pad)
      }
    }
    const headerLine =
      '| ' + headers.map((h, i) => alignCell(h, widths[i]!, i)).join(' | ') + ' |'
    const separatorLine =
      '| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |'
    const dataLines = rows.map(
      (row) =>
        '| ' +
        row.map((cell, i) => alignCell(cell, widths[i]!, i)).join(' | ') +
        ' |',
    )
    return [headerLine, separatorLine, ...dataLines].join('\n')
  }

  formatList(items: string[], bullet: string = '-'): string {
    if (items.length === 0) return ''
    if (bullet === '1.' || bullet.match(/^\d+\.?$/)) {
      return items
        .map((item, i) => `${i + 1}. ${item}`)
        .join('\n')
    }
    return items.map((item) => `${bullet} ${item}`).join('\n')
  }

  wrapText(text: string, width: number): string {
    if (text.length <= width) return text
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      if (currentLine.length === 0) {
        currentLine = word
      } else if (currentLine.length + 1 + word.length <= width) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }
    return lines.join('\n')
  }

  getOptions(): RenderOptions {
    return { ...this.options }
  }

  reset(): void {
    this.buffer = []
    this.options = { ...DEFAULT_OPTIONS }
  }

  private csvEscape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"'
    }
    return value
  }
}
