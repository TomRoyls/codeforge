import { TableBuilder } from './table-builder.js'
import { DEFAULT_REPORT_CONFIG } from './types.js'
import { clamp } from '../../utils/math-helpers.js'
import type { ReportConfig, ReportSection, SeverityBadge, MarkdownTableConfig } from './types.js'

const SEVERITY_ICONS: Record<SeverityBadge, string> = {
  critical: '🟥',
  high: '🟧',
  medium: '🟨',
  low: '🟩',
  info: '🟦',
}

const SEVERITY_LABELS: Record<SeverityBadge, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  info: 'INFO',
}

export class MarkdownReporter {
  private config: ReportConfig

  constructor(config?: Partial<ReportConfig>) {
    this.config = { ...DEFAULT_REPORT_CONFIG, ...config }
  }

  heading(text: string, level: number): string {
    const clampedLevel = clamp(level, 1, 6)
    return '#'.repeat(clampedLevel) + ' ' + text
  }

  paragraph(text: string): string {
    return text
  }

  codeBlock(code: string, language?: string): string {
    const lang = language ?? ''
    const lines = code.split('\n')
    const maxLines = this.config.maxCodeBlockLines
    if (lines.length > maxLines) {
      const truncated = lines.slice(0, maxLines)
      return '```' + lang + '\n' + truncated.join('\n') + '\n... (' + (lines.length - maxLines) + ' more lines)\n```'
    }
    return '```' + lang + '\n' + code + '\n```'
  }

  bold(text: string): string {
    return '**' + text + '**'
  }

  italic(text: string): string {
    return '*' + text + '*'
  }

  strikethrough(text: string): string {
    return '~~' + text + '~~'
  }

  link(text: string, url: string): string {
    return '[' + text + '](' + url + ')'
  }

  image(alt: string, url: string): string {
    return '![' + alt + '](' + url + ')'
  }

  list(items: string[], ordered?: boolean): string {
    if (items.length === 0) return ''
    if (ordered) {
      return items.map((item, i) => (i + 1) + '. ' + item).join('\n')
    }
    return items.map((item) => '- ' + item).join('\n')
  }

  badge(label: string, severity: SeverityBadge): string {
    if (this.config.severityIcons) {
      const icon = SEVERITY_ICONS[severity]
      const severityLabel = SEVERITY_LABELS[severity]
      return icon + ' ' + label + ' [' + severityLabel + ']'
    }
    return '![' + SEVERITY_LABELS[severity] + ']'
  }

  table(config: MarkdownTableConfig): string {
    return TableBuilder.fromConfig(config)
  }

  hr(): string {
    return '---'
  }

  blockquote(text: string): string {
    return '> ' + text
  }

  generateReport(sections: ReportSection[]): string {
    const parts: string[] = []

    if (this.config.includeTimestamp) {
      parts.push(this.heading('Report', 1))
      parts.push('Generated: ' + new Date().toISOString())
      parts.push('')
    } else {
      parts.push(this.heading('Report', 1))
      parts.push('')
    }

    if (this.config.includeTOC && sections.length > 0) {
      parts.push(this.heading('Table of Contents', 2))
      parts.push(this.buildTOC(sections, 3))
      parts.push('')
    }

    parts.push(this.renderSections(sections, 2))

    return parts.join('\n')
  }

  getConfig(): ReportConfig {
    return { ...this.config }
  }

  private buildTOC(sections: ReportSection[], level: number): string {
    const lines: string[] = []
    for (const section of sections) {
      const indent = '  '.repeat(level - 3)
      lines.push(indent + '- [' + section.title + '](#' + this.slugify(section.title) + ')')
      if (section.subsections.length > 0) {
        lines.push(this.buildTOC(section.subsections, level + 1))
      }
    }
    return lines.join('\n')
  }

  private renderSections(sections: ReportSection[], level: number): string {
    const parts: string[] = []
    for (const section of sections) {
      parts.push(this.heading(section.title, level))
      if (section.content.length > 0) {
        parts.push(section.content)
      }
      if (section.subsections.length > 0) {
        parts.push(this.renderSections(section.subsections, level + 1))
      }
    }
    return parts.join('\n')
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
}
