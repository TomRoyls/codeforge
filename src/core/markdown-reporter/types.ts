export interface ReportSection {
  title: string
  content: string
  subsections: ReportSection[]
}

export type SeverityBadge = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface MarkdownTableConfig {
  headers: string[]
  rows: string[][]
  alignment: ('left' | 'center' | 'right')[]
}

export interface ReportConfig {
  includeTOC: boolean
  includeTimestamp: boolean
  maxCodeBlockLines: number
  severityIcons: boolean
}

export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  includeTOC: true,
  includeTimestamp: true,
  maxCodeBlockLines: 10,
  severityIcons: true,
}
