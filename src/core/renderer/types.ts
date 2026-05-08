export interface TableColumn {
  key: string
  header: string
  width?: number
  align: 'left' | 'center' | 'right'
  sortable: boolean
  format?: (value: unknown) => string
}

export interface TableRow {
  [key: string]: unknown
}

export interface TableConfig {
  columns: TableColumn[]
  maxWidth: number
  showHeader: boolean
  showBorders: boolean
  showRowNumbers: boolean
  sortBy?: { key: string; direction: 'asc' | 'desc' }
}

export interface TextStyle {
  bold: boolean
  italic: boolean
  underline: boolean
  dim: boolean
  color: 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'
  bg?: 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'
}

export interface FormattedString {
  text: string
  style: TextStyle
}

export interface ProgressConfig {
  total: number
  width: number
  fillChar: string
  emptyChar: string
  showPercent: boolean
  showCount: boolean
  showETA: boolean
}

export interface ProgressState {
  current: number
  total: number
  percent: number
  elapsed: number
  eta: number
  startTime: number
}

export const DEFAULT_TABLE_CONFIG: Omit<TableConfig, 'columns'> = {
  maxWidth: 80,
  showHeader: true,
  showBorders: true,
  showRowNumbers: false,
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  bold: false,
  italic: false,
  underline: false,
  dim: false,
  color: 'white',
}

export const DEFAULT_PROGRESS_CONFIG: ProgressConfig = {
  total: 100,
  width: 30,
  fillChar: '█',
  emptyChar: '░',
  showPercent: true,
  showCount: true,
  showETA: true,
}
