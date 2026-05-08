export type RenderFormat = 'text' | 'json' | 'table' | 'list' | 'csv'

export interface RenderTheme {
  success: string
  error: string
  warning: string
  info: string
  highlight: string
  dim: string
  bold: string
  reset: string
}

export interface RenderOptions {
  format: RenderFormat
  theme: RenderTheme
  color: boolean
  indent: number
  maxWidth: number
}

export interface Renderable {
  type: 'heading' | 'text' | 'list' | 'table' | 'code' | 'divider' | 'group'
  content: unknown
  options: Record<string, unknown>
}

export interface TableData {
  headers: string[]
  rows: unknown[][]
  alignments: ('left' | 'right' | 'center')[]
}

export interface ListData {
  items: string[]
  ordered: boolean
  bullet: string
}
