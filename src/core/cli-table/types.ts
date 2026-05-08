export interface ColumnConfig {
  header: string
  width?: number
  alignment?: 'left' | 'center' | 'right'
  maxWidth: number
  minWidth: number
}

export interface TableConfig {
  borderStyle: 'none' | 'single' | 'double' | 'rounded'
  showHeader: boolean
  showRowSeparator: boolean
  padding: number
  truncate: boolean
}

export interface BorderChars {
  topLeft: string
  topRight: string
  topMid: string
  topHorizontal: string
  midLeft: string
  midRight: string
  midMid: string
  midHorizontal: string
  bottomLeft: string
  bottomRight: string
  bottomMid: string
  bottomHorizontal: string
  vertical: string
  left: string
  right: string
}
