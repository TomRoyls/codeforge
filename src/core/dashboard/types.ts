export interface DashboardConfig {
  width: number
  theme: 'dark' | 'light' | 'plain'
  showSparklines: boolean
  showCharts: boolean
  compact: boolean
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  width: 80,
  theme: 'dark',
  showSparklines: true,
  showCharts: true,
  compact: false,
}

export interface DashboardData {
  title: string
  sections: DashboardSection[]
  footer?: string
}

export interface DashboardSection {
  title: string
  type: 'table' | 'chart' | 'sparkline' | 'gauge' | 'list' | 'summary'
  data: unknown
}

export interface TableData {
  headers: string[]
  rows: string[][]
  align: ('left' | 'center' | 'right')[]
}

export interface ChartData {
  label: string
  values: number[]
  labels: string[]
  max: number
}

export interface SparklineData {
  values: number[]
  label: string
}

export interface GaugeData {
  value: number
  max: number
  label: string
  thresholds: { value: number; color: string }[]
}

export interface SummaryData {
  items: Array<{
    label: string
    value: string | number
    status?: 'good' | 'warning' | 'error'
  }>
}
