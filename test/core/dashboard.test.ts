import { describe, expect, it } from 'vitest'
import { DashboardRenderer } from '../../src/core/dashboard/dashboard-renderer.js'
import type {
  ChartData,
  DashboardData,
  GaugeData,
  SparklineData,
  SummaryData,
  TableData,
} from '../../src/core/dashboard/types.js'

describe('DashboardRenderer', () => {
  const renderer = new DashboardRenderer({ width: 60 })

  // --- renderRule ---
  it('renders a horizontal rule with default char', () => {
    const result = renderer.renderRule()
    expect(result).toBe('-'.repeat(60))
  })

  it('renders a horizontal rule with custom char', () => {
    const result = renderer.renderRule('=')
    expect(result).toBe('='.repeat(60))
  })

  it('renders a rule with asterisk', () => {
    const result = renderer.renderRule('*')
    expect(result).toBe('*'.repeat(60))
  })

  // --- renderTitle ---
  it('renders a title centered', () => {
    const result = renderer.renderTitle('My Dashboard')
    expect(result.length).toBe(60)
    expect(result.trim()).toBe('My Dashboard')
  })

  it('renders a title with exact width', () => {
    const r = new DashboardRenderer({ width: 12 })
    const result = r.renderTitle('Hello World!')
    expect(result).toBe('Hello World!')
  })

  // --- renderSectionTitle ---
  it('renders section title in normal mode', () => {
    const result = renderer.renderSectionTitle('Metrics')
    expect(result).toBe('== Metrics ==')
  })

  it('renders section title in compact mode', () => {
    const compact = new DashboardRenderer({ width: 60, compact: true })
    const result = compact.renderSectionTitle('Metrics')
    expect(result).toBe('> Metrics')
  })

  // --- renderTable ---
  it('renders a table with headers and rows', () => {
    const data: TableData = {
      headers: ['Name', 'Value'],
      rows: [
        ['Files', '42'],
        ['Errors', '3'],
      ],
      align: ['left', 'right'],
    }
    const result = renderer.renderTable(data)
    const lines = result.split('\n')
    expect(lines.length).toBe(6)
    expect(lines[0]).toContain('\u2500')
    expect(lines[1]).toContain('Name')
    expect(lines[1]).toContain('Value')
    expect(lines[2]).toContain('\u2500')
    expect(lines[3]).toContain('Files')
    expect(lines[3]).toContain('42')
    expect(lines[4]).toContain('Errors')
    expect(lines[4]).toContain('3')
    expect(lines[5]).toContain('\u2500')
  })

  it('renders empty table with no headers', () => {
    const data: TableData = {
      headers: [],
      rows: [],
      align: [],
    }
    const result = renderer.renderTable(data)
    expect(result).toBe('')
  })

  it('renders table with center alignment', () => {
    const data: TableData = {
      headers: ['A'],
      rows: [['x']],
      align: ['center'],
    }
    const result = renderer.renderTable(data)
    const lines = result.split('\n')
    expect(lines[1]).toContain('A')
    expect(lines[3]).toContain('x')
  })

  it('renders table with no rows', () => {
    const data: TableData = {
      headers: ['Col1', 'Col2'],
      rows: [],
      align: ['left', 'left'],
    }
    const result = renderer.renderTable(data)
    const lines = result.split('\n')
    expect(lines.length).toBe(4)
  })

  it('renders table respecting column widths', () => {
    const data: TableData = {
      headers: ['Short', 'LongerColumnName'],
      rows: [['a', 'b']],
      align: ['left', 'left'],
    }
    const result = renderer.renderTable(data)
    const headerLine = result.split('\n')[1]!
    expect(headerLine).toContain('LongerColumnName')
  })

  // --- renderChart ---
  it('renders a bar chart', () => {
    const data: ChartData = {
      label: 'Test',
      values: [10, 20, 30],
      labels: ['A', 'B', 'C'],
      max: 30,
    }
    const result = renderer.renderChart(data)
    const lines = result.split('\n')
    expect(lines.length).toBe(3)
    expect(lines[0]).toContain('A')
    expect(lines[1]).toContain('B')
    expect(lines[2]).toContain('C')
  })

  it('renders chart with empty values', () => {
    const data: ChartData = {
      label: 'Test',
      values: [],
      labels: [],
      max: 0,
    }
    const result = renderer.renderChart(data)
    expect(result).toBe('')
  })

  it('renders chart with zero max', () => {
    const data: ChartData = {
      label: 'Test',
      values: [0, 0, 0],
      labels: ['X', 'Y', 'Z'],
      max: 0,
    }
    const result = renderer.renderChart(data)
    const lines = result.split('\n')
    expect(lines.length).toBe(3)
  })

  it('renders chart bars proportional to max', () => {
    const data: ChartData = {
      label: 'Test',
      values: [50],
      labels: ['Half'],
      max: 100,
    }
    const result = renderer.renderChart(data)
    expect(result).toContain('\u2588')
  })

  // --- renderSparkline ---
  it('renders a sparkline', () => {
    const data: SparklineData = {
      values: [1, 2, 3, 4, 5, 6, 7, 8],
      label: 'CPU',
    }
    const result = renderer.renderSparkline(data)
    expect(result).toContain('CPU:')
    expect(result.length).toBeGreaterThan(4)
  })

  it('renders sparkline with empty values', () => {
    const data: SparklineData = {
      values: [],
      label: 'Empty',
    }
    const result = renderer.renderSparkline(data)
    expect(result).toBe('Empty: ')
  })

  it('renders sparkline with all same values', () => {
    const data: SparklineData = {
      values: [5, 5, 5, 5],
      label: 'Flat',
    }
    const result = renderer.renderSparkline(data)
    expect(result).toContain('Flat:')
  })

  it('renders sparkline with single value', () => {
    const data: SparklineData = {
      values: [42],
      label: 'One',
    }
    const result = renderer.renderSparkline(data)
    expect(result).toContain('One:')
  })

  it('renders sparkline with min at zero', () => {
    const data: SparklineData = {
      values: [0, 5, 10],
      label: 'Range',
    }
    const result = renderer.renderSparkline(data)
    expect(result).toContain('Range:')
    const sparkPart = result.split(': ')[1]!
    expect(sparkPart[0]).toBe('\u2581')
    expect(sparkPart[2]).toBe('\u2588')
  })

  // --- renderGauge ---
  it('renders a gauge at 50%', () => {
    const data: GaugeData = {
      value: 50,
      max: 100,
      label: 'Progress',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('Progress:')
    expect(result).toContain('50%')
    expect(result).toContain('[')
    expect(result).toContain(']')
  })

  it('renders gauge at 0%', () => {
    const data: GaugeData = {
      value: 0,
      max: 100,
      label: 'Empty',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('  0%')
  })

  it('renders gauge at 100%', () => {
    const data: GaugeData = {
      value: 100,
      max: 100,
      label: 'Full',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('100%')
  })

  it('renders gauge with zero max', () => {
    const data: GaugeData = {
      value: 5,
      max: 0,
      label: 'Zero',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('  0%')
  })

  it('renders gauge clamped above max', () => {
    const data: GaugeData = {
      value: 150,
      max: 100,
      label: 'Over',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('100%')
  })

  it('renders gauge with thresholds', () => {
    const data: GaugeData = {
      value: 80,
      max: 100,
      label: 'Health',
      thresholds: [
        { value: 0, color: 'green' },
        { value: 60, color: 'yellow' },
        { value: 80, color: 'red' },
      ],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('Health:')
    expect(result).toContain('80%')
  })

  // --- renderSummary ---
  it('renders a summary with status markers', () => {
    const data: SummaryData = {
      items: [
        { label: 'Tests', value: '42', status: 'good' },
        { label: 'Warnings', value: '3', status: 'warning' },
        { label: 'Errors', value: '1', status: 'error' },
      ],
    }
    const result = renderer.renderSummary(data)
    expect(result).toContain('[OK] Tests')
    expect(result).toContain('[!!] Warnings')
    expect(result).toContain('[XX] Errors')
  })

  it('renders summary with default status', () => {
    const data: SummaryData = {
      items: [{ label: 'Count', value: 10 }],
    }
    const result = renderer.renderSummary(data)
    expect(result).toContain('[--] Count')
    expect(result).toContain('10')
  })

  it('renders summary with numeric values', () => {
    const data: SummaryData = {
      items: [
        { label: 'Lines', value: 1000, status: 'good' },
        { label: 'Files', value: 50, status: 'good' },
      ],
    }
    const result = renderer.renderSummary(data)
    const lines = result.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('1000')
    expect(lines[1]).toContain('50')
  })

  // --- renderList ---
  it('renders a list', () => {
    const result = renderer.renderList(['item1', 'item2', 'item3'])
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('  - item1')
    expect(lines[1]).toBe('  - item2')
    expect(lines[2]).toBe('  - item3')
  })

  it('renders empty list', () => {
    const result = renderer.renderList([])
    expect(result).toBe('')
  })

  // --- renderKeyValue ---
  it('renders key value pair', () => {
    const result = renderer.renderKeyValue('Name', 'Value')
    expect(result).toContain('Name')
    expect(result).toContain('Value')
    expect(result).toContain('.')
    expect(result.length).toBe(60)
  })

  it('renders key value with long strings that exceed width', () => {
    const r = new DashboardRenderer({ width: 20 })
    const result = r.renderKeyValue('VeryLongKey', 'VeryLongValue')
    expect(result).toContain('VeryLongKey')
    expect(result).toContain('VeryLongValue')
  })

  // --- fitWidth ---
  it('pads text on right for left align', () => {
    const result = renderer.fitWidth('hello', 'left')
    expect(result).toBe('hello' + ' '.repeat(55))
    expect(result.length).toBe(60)
  })

  it('pads text on left for right align', () => {
    const result = renderer.fitWidth('hello', 'right')
    expect(result).toBe(' '.repeat(55) + 'hello')
    expect(result.length).toBe(60)
  })

  it('centers text for center align', () => {
    const result = renderer.fitWidth('hello', 'center')
    expect(result.length).toBe(60)
    expect(result.trim()).toBe('hello')
  })

  it('truncates text that exceeds width', () => {
    const r = new DashboardRenderer({ width: 5 })
    const result = r.fitWidth('hello world', 'left')
    expect(result).toBe('hello')
  })

  it('handles exact width text', () => {
    const r = new DashboardRenderer({ width: 5 })
    const result = r.fitWidth('hello', 'left')
    expect(result).toBe('hello')
  })

  // --- wrapText ---
  it('wraps text into multiple lines', () => {
    const r = new DashboardRenderer({ width: 10 })
    const result = r.wrapText('hello world this is a test')
    expect(result.length).toBeGreaterThan(1)
    for (const line of result) {
      expect(line.length).toBeLessThanOrEqual(10)
    }
  })

  it('returns single line for short text', () => {
    const result = renderer.wrapText('short')
    expect(result).toEqual(['short'])
  })

  it('wraps long word that exceeds width', () => {
    const r = new DashboardRenderer({ width: 5 })
    const result = r.wrapText('abcdefghij')
    expect(result).toEqual(['abcdefghij'])
  })

  it('handles empty text', () => {
    const result = renderer.wrapText('')
    expect(result).toEqual([])
  })

  it('preserves words on boundary', () => {
    const r = new DashboardRenderer({ width: 11 })
    const result = r.wrapText('hello world')
    expect(result).toEqual(['hello world'])
  })

  // --- render (full dashboard) ---
  it('renders a complete dashboard', () => {
    const data: DashboardData = {
      title: 'CodeForge Report',
      sections: [
        {
          title: 'Files',
          type: 'table',
          data: {
            headers: ['Name', 'LOC'],
            rows: [['index.ts', '120']],
            align: ['left', 'right'],
          } satisfies TableData,
        },
        {
          title: 'Complexity',
          type: 'gauge',
          data: {
            value: 7,
            max: 10,
            label: 'Score',
            thresholds: [],
          } satisfies GaugeData,
        },
        {
          title: 'Trend',
          type: 'sparkline',
          data: {
            values: [1, 3, 5, 7, 9],
            label: 'Commits',
          } satisfies SparklineData,
        },
        {
          title: 'Status',
          type: 'summary',
          data: {
            items: [
              { label: 'Build', value: 'OK', status: 'good' },
            ],
          } satisfies SummaryData,
        },
        {
          title: 'Notes',
          type: 'list',
          data: ['Note 1', 'Note 2'],
        },
      ],
      footer: 'Generated by CodeForge',
    }

    const result = renderer.render(data)
    expect(result).toContain('CodeForge Report')
    expect(result).toContain('== Files ==')
    expect(result).toContain('Name')
    expect(result).toContain('LOC')
    expect(result).toContain('== Complexity ==')
    expect(result).toContain('Score:')
    expect(result).toContain('== Trend ==')
    expect(result).toContain('Commits:')
    expect(result).toContain('== Status ==')
    expect(result).toContain('[OK] Build')
    expect(result).toContain('== Notes ==')
    expect(result).toContain('- Note 1')
    expect(result).toContain('- Note 2')
    expect(result).toContain('Generated by CodeForge')
  })

  it('renders dashboard without footer', () => {
    const data: DashboardData = {
      title: 'Test',
      sections: [],
    }
    const result = renderer.render(data)
    expect(result).toContain('Test')
    expect(result).not.toContain('Generated')
  })

  // --- constructor ---
  it('uses default config when no config provided', () => {
    const r = new DashboardRenderer()
    const result = r.renderRule()
    expect(result.length).toBe(80)
  })

  it('merges partial config with defaults', () => {
    const r = new DashboardRenderer({ width: 40 })
    const result = r.renderRule()
    expect(result.length).toBe(40)
  })

  // --- chart with showCharts false ---
  it('skips chart when showCharts is false', () => {
    const r = new DashboardRenderer({ width: 60, showCharts: false })
    const data: DashboardData = {
      title: 'Test',
      sections: [
        {
          title: 'Chart',
          type: 'chart',
          data: {
            label: 'Test',
            values: [10],
            labels: ['A'],
            max: 10,
          } satisfies ChartData,
        },
      ],
    }
    const result = r.render(data)
    expect(result).toContain('== Chart ==')
    const lines = result.split('\n')
    const chartSectionIdx = lines.findIndex((l) => l.includes('== Chart =='))
    const afterChart = lines.slice(chartSectionIdx + 1)
    const nextSectionOrRule = afterChart.findIndex(
      (l) => l.includes('==') || l.match(/^={3,}$/),
    )
    const sectionContent = afterChart.slice(0, nextSectionOrRule > 0 ? nextSectionOrRule : afterChart.length)
    const nonEmpty = sectionContent.filter((l) => l.trim().length > 0)
    expect(nonEmpty.length).toBe(0)
  })

  // --- sparkline with showSparklines false ---
  it('skips sparkline when showSparklines is false', () => {
    const r = new DashboardRenderer({ width: 60, showSparklines: false })
    const data: DashboardData = {
      title: 'Test',
      sections: [
        {
          title: 'Trend',
          type: 'sparkline',
          data: {
            values: [1, 2, 3],
            label: 'CPU',
          } satisfies SparklineData,
        },
      ],
    }
    const result = r.render(data)
    expect(result).toContain('== Trend ==')
    expect(result).not.toContain('CPU:')
  })

  // --- summary with dots alignment ---
  it('renders summary with dot leaders', () => {
    const r = new DashboardRenderer({ width: 30 })
    const data: SummaryData = {
      items: [
        { label: 'Short', value: 'val', status: 'good' },
      ],
    }
    const result = r.renderSummary(data)
    expect(result).toContain('.')
    expect(result.length).toBeGreaterThan(10)
  })

  // --- gauge with thresholds matching colors ---
  it('uses different fill chars for threshold colors', () => {
    const greenData: GaugeData = {
      value: 30,
      max: 100,
      label: 'G',
      thresholds: [{ value: 0, color: 'green' }],
    }
    const yellowData: GaugeData = {
      value: 70,
      max: 100,
      label: 'Y',
      thresholds: [
        { value: 0, color: 'green' },
        { value: 60, color: 'yellow' },
      ],
    }
    const redData: GaugeData = {
      value: 90,
      max: 100,
      label: 'R',
      thresholds: [{ value: 80, color: 'red' }],
    }
    const orangeData: GaugeData = {
      value: 60,
      max: 100,
      label: 'O',
      thresholds: [{ value: 50, color: 'orange' }],
    }

    const greenResult = renderer.renderGauge(greenData)
    const yellowResult = renderer.renderGauge(yellowData)
    const redResult = renderer.renderGauge(redData)
    const orangeResult = renderer.renderGauge(orangeData)

    expect(greenResult).toContain('\u2588')
    expect(yellowResult).toContain('\u2593')
    expect(redResult).toContain('\u2591')
    expect(orangeResult).toContain('\u2592')
  })

  // --- negative gauge value ---
  it('renders gauge with negative value clamped to 0', () => {
    const data: GaugeData = {
      value: -10,
      max: 100,
      label: 'Neg',
      thresholds: [],
    }
    const result = renderer.renderGauge(data)
    expect(result).toContain('  0%')
  })

  // --- table with unicode content ---
  it('renders table with unicode characters in cells', () => {
    const data: TableData = {
      headers: ['Rule', 'Status'],
      rows: [['no-eval', '[OK]']],
      align: ['left', 'left'],
    }
    const result = renderer.renderTable(data)
    expect(result).toContain('no-eval')
    expect(result).toContain('[OK]')
  })
})
