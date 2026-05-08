import type {
  ChartData,
  DashboardConfig,
  DashboardData,
  DashboardSection,
  GaugeData,
  SparklineData,
  SummaryData,
  TableData,
} from './types.js'
import { DEFAULT_DASHBOARD_CONFIG } from './types.js'

const SPARKLINE_CHARS = '\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588'

const BAR_CHARS = {
  full: '\u2588',
  high: '\u2593',
  medium: '\u2592',
  low: '\u2591',
  empty: '\u0020',
}

export class DashboardRenderer {
  private config: DashboardConfig

  constructor(config?: Partial<DashboardConfig>) {
    this.config = { ...DEFAULT_DASHBOARD_CONFIG, ...config }
  }

  render(data: DashboardData): string {
    const lines: string[] = []

    lines.push(this.renderRule('='))
    lines.push(this.renderTitle(data.title))
    lines.push(this.renderRule('='))

    for (const section of data.sections) {
      lines.push('')
      lines.push(this.renderSectionTitle(section.title))
      lines.push(this.renderSection(section))
    }

    if (data.footer) {
      lines.push('')
      lines.push(this.renderRule('-'))
      lines.push(this.fitWidth(data.footer, 'center'))
    }

    lines.push(this.renderRule('='))

    return lines.join('\n')
  }

  renderRule(char: string = '-'): string {
    return char.repeat(this.config.width)
  }

  renderTitle(title: string): string {
    return this.fitWidth(title, 'center')
  }

  renderSectionTitle(title: string): string {
    const prefix = this.config.compact ? '> ' : '== '
    const suffix = this.config.compact ? '' : ' =='
    return `${prefix}${title}${suffix}`
  }

  renderTable(data: TableData): string {
    const { headers, rows, align } = data
    if (headers.length === 0) return ''

    const colWidths = headers.map((h, i) => {
      const headerLen = this.visibleLength(h)
      const rowLen = rows.reduce((max, row) => {
        const cell = row[i]
        return cell !== undefined ? Math.max(max, this.visibleLength(cell)) : max
      }, 0)
      return Math.max(headerLen, rowLen)
    })

    const separator = this.renderTableSeparator(colWidths)
    const lines: string[] = []

    lines.push(separator)
    lines.push(this.renderTableRow(headers, colWidths, align))
    lines.push(separator)

    for (const row of rows) {
      lines.push(this.renderTableRow(row, colWidths, align))
    }

    lines.push(separator)

    return lines.join('\n')
  }

  renderChart(data: ChartData): string {
    const { values, labels, max } = data
    if (values.length === 0) return ''

    const maxLabelLen = labels.reduce(
      (max, l) => Math.max(max, this.visibleLength(l)),
      0,
    )
    const barWidth = this.config.width - maxLabelLen - 3
    const lines: string[] = []

    for (let i = 0; i < values.length; i++) {
      const ratio = max > 0 ? values[i]! / max : 0
      const filledWidth = Math.round(ratio * barWidth)
      const emptyWidth = barWidth - filledWidth
      const bar = BAR_CHARS.full.repeat(Math.max(0, filledWidth)) + BAR_CHARS.empty.repeat(Math.max(0, emptyWidth))
      const paddedLabel = this.padToWidth(labels[i] ?? '', maxLabelLen, 'right')
      lines.push(`${paddedLabel} | ${bar}`)
    }

    return lines.join('\n')
  }

  renderSparkline(data: SparklineData): string {
    const { values, label } = data
    if (values.length === 0) return `${label}: `

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    const chars = values.map((v) => {
      if (range === 0) return SPARKLINE_CHARS[4]!
      const normalized = (v - min) / range
      const index = Math.min(Math.floor(normalized * 8), 7)
      return SPARKLINE_CHARS[index]!
    })

    return `${label}: ${chars.join('')}`
  }

  renderGauge(data: GaugeData): string {
    const { value, max, label } = data
    const ratio = max > 0 ? value / max : 0
    const clampedRatio = Math.min(Math.max(ratio, 0), 1)
    const percentage = Math.round(clampedRatio * 100)

    const gaugeWidth = this.config.width - label.length - 8
    const filled = Math.round(clampedRatio * gaugeWidth)
    const empty = gaugeWidth - filled

    const fillChar = this.getGaugeFillChar(clampedRatio, data.thresholds)
    const gaugeStr = fillChar.repeat(Math.max(0, filled)) + BAR_CHARS.empty.repeat(Math.max(0, empty))

    return `${label}: [${gaugeStr}] ${String(percentage).padStart(3)}%`
  }

  renderSummary(data: SummaryData): string {
    const lines: string[] = []

    for (const item of data.items) {
      const statusMarker = this.getStatusMarker(item.status)
      const valueStr = String(item.value)
      const dotsNeeded = this.config.width - statusMarker.length - item.label.length - valueStr.length - 3
      const dots = dotsNeeded > 0 ? '.'.repeat(dotsNeeded) : ''
      lines.push(`${statusMarker} ${item.label} ${dots} ${valueStr}`)
    }

    return lines.join('\n')
  }

  renderList(items: string[]): string {
    return items.map((item) => `  - ${item}`).join('\n')
  }

  renderKeyValue(key: string, value: string): string {
    const dotsNeeded = this.config.width - key.length - value.length - 2
    const dots = dotsNeeded > 0 ? '.'.repeat(dotsNeeded) : ''
    return `${key} ${dots} ${value}`
  }

  fitWidth(text: string, align: 'left' | 'center' | 'right' = 'left'): string {
    const textLen = this.visibleLength(text)
    const width = this.config.width

    if (textLen >= width) {
      return this.truncateToWidth(text, width)
    }

    const padding = width - textLen

    switch (align) {
      case 'center': {
        const leftPad = Math.floor(padding / 2)
        const rightPad = padding - leftPad
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
      }
      case 'right':
        return ' '.repeat(padding) + text
      default:
        return text + ' '.repeat(padding)
    }
  }

  wrapText(text: string): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      if (currentLine.length === 0) {
        currentLine = word
      } else if (currentLine.length + 1 + word.length <= this.config.width) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine)
    }

    return lines
  }

  private renderSection(section: DashboardSection): string {
    switch (section.type) {
      case 'table':
        return this.renderTable(section.data as TableData)
      case 'chart':
        return this.config.showCharts
          ? this.renderChart(section.data as ChartData)
          : ''
      case 'sparkline':
        return this.config.showSparklines
          ? this.renderSparkline(section.data as SparklineData)
          : ''
      case 'gauge':
        return this.renderGauge(section.data as GaugeData)
      case 'list':
        return this.renderList(section.data as string[])
      case 'summary':
        return this.renderSummary(section.data as SummaryData)
      default:
        return ''
    }
  }

  private renderTableSeparator(colWidths: number[]): string {
    const parts = colWidths.map((w) => '\u2500'.repeat(w + 2))
    return `\u250C${parts.join('\u253C')}\u2510`
  }

  private renderTableRow(
    cells: string[],
    colWidths: number[],
    align: ('left' | 'center' | 'right')[],
  ): string {
    const parts = cells.map((cell, i) => {
      const width = colWidths[i] ?? 0
      const cellAlign = align[i] ?? 'left'
      const padded = this.padToWidth(cell, width, cellAlign)
      return ` ${padded} `
    })
    return `\u2502${parts.join('\u2502')}\u2502`
  }

  private padToWidth(
    text: string,
    targetWidth: number,
    align: 'left' | 'center' | 'right',
  ): string {
    const textLen = this.visibleLength(text)
    if (textLen >= targetWidth) {
      return this.truncateToWidth(text, targetWidth)
    }
    const padding = targetWidth - textLen

    switch (align) {
      case 'center': {
        const leftPad = Math.floor(padding / 2)
        const rightPad = padding - leftPad
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
      }
      case 'right':
        return ' '.repeat(padding) + text
      default:
        return text + ' '.repeat(padding)
    }
  }

  private truncateToWidth(text: string, width: number): string {
    let result = ''
    let visibleLen = 0
    for (const char of text) {
      const charLen = this.charWidth(char)
      if (visibleLen + charLen > width) break
      result += char
      visibleLen += charLen
    }
    return result
  }

  private visibleLength(text: string): number {
    let len = 0
    for (const char of text) {
      len += this.charWidth(char)
    }
    return len
  }

  private charWidth(_char: string): number {
    return 1
  }

  private getStatusMarker(
    status?: 'good' | 'warning' | 'error',
  ): string {
    switch (status) {
      case 'good':
        return '[OK]'
      case 'warning':
        return '[!!]'
      case 'error':
        return '[XX]'
      default:
        return '[--]'
    }
  }

  private getGaugeFillChar(
    ratio: number,
    thresholds: { value: number; color: string }[],
  ): string {
    const percentage = ratio * 100

    const sorted = [...thresholds].sort(
      (a, b) => a.value - b.value,
    )

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (percentage >= sorted[i]!.value) {
        const color = sorted[i]!.color.toLowerCase()
        switch (color) {
          case 'green':
            return BAR_CHARS.full
          case 'yellow':
            return BAR_CHARS.high
          case 'orange':
            return BAR_CHARS.medium
          case 'red':
            return BAR_CHARS.low
        }
      }
    }

    return BAR_CHARS.full
  }
}
