import { describe, it, expect } from 'vitest'
import { DashboardRenderer, DEFAULT_DASHBOARD_CONFIG } from '../src/core/dashboard/index.js'
import type { DashboardData, TableData, ChartData, SparklineData, GaugeData, SummaryData } from '../src/core/dashboard/index.js'

// ─── DashboardRenderer Construction ───

describe('DashboardRenderer', () => {
  describe('construction', () => {
    it('should use default config width of 80', () => {
      const renderer = new DashboardRenderer()
      expect(renderer.renderRule('=')).toBe('='.repeat(80))
    })

    it('should accept custom width config', () => {
      const renderer = new DashboardRenderer({ width: 40 })
      expect(renderer.renderRule('-')).toBe('-'.repeat(40))
    })
  })

  // ─── renderRule ───

  describe('renderRule', () => {
    it('should repeat character to config width', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      expect(renderer.renderRule('*')).toBe('**********')
    })

    it('should default to dash character', () => {
      const renderer = new DashboardRenderer({ width: 5 })
      expect(renderer.renderRule()).toBe('-----')
    })
  })

  // ─── renderTitle ───

  describe('renderTitle', () => {
    it('should center title text', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      const title = renderer.renderTitle('Hi')
      expect(title.length).toBe(10)
      expect(title).toContain('Hi')
    })
  })

  // ─── renderSectionTitle ───

  describe('renderSectionTitle', () => {
    it('should render section title in normal mode', () => {
      const renderer = new DashboardRenderer({ compact: false })
      expect(renderer.renderSectionTitle('Metrics')).toBe('== Metrics ==')
    })

    it('should render section title in compact mode', () => {
      const renderer = new DashboardRenderer({ compact: true })
      expect(renderer.renderSectionTitle('Metrics')).toBe('> Metrics')
    })
  })

  // ─── renderTable ───

  describe('renderTable', () => {
    it('should render a table with headers and rows', () => {
      const renderer = new DashboardRenderer({ width: 80 })
      const data: TableData = {
        headers: ['Name', 'Value'],
        rows: [['foo', '42']],
        align: ['left', 'right'],
      }
      const output = renderer.renderTable(data)
      expect(output).toContain('Name')
      expect(output).toContain('foo')
      expect(output).toContain('42')
    })

    it('should return empty string for empty headers', () => {
      const renderer = new DashboardRenderer()
      const data: TableData = { headers: [], rows: [], align: [] }
      expect(renderer.renderTable(data)).toBe('')
    })
  })

  // ─── renderChart ───

  describe('renderChart', () => {
    it('should render horizontal bar chart', () => {
      const renderer = new DashboardRenderer({ width: 60, showCharts: true })
      const data: ChartData = {
        label: 'Issues',
        values: [10, 5, 2],
        labels: ['Errors', 'Warnings', 'Info'],
        max: 10,
      }
      const output = renderer.renderChart(data)
      expect(output).toContain('Errors')
      expect(output).toContain('Warnings')
      expect(output).toContain('Info')
    })

    it('should return empty string for empty values', () => {
      const renderer = new DashboardRenderer()
      const data: ChartData = { label: 'X', values: [], labels: [], max: 0 }
      expect(renderer.renderChart(data)).toBe('')
    })
  })

  // ─── renderSparkline ───

  describe('renderSparkline', () => {
    it('should render a sparkline from values', () => {
      const renderer = new DashboardRenderer()
      const data: SparklineData = { values: [1, 3, 5, 7, 9], label: 'Activity' }
      const output = renderer.renderSparkline(data)
      expect(output).toContain('Activity:')
      expect(output.length).toBeGreaterThan('Activity: '.length)
    })

    it('should handle empty values', () => {
      const renderer = new DashboardRenderer()
      const data: SparklineData = { values: [], label: 'Empty' }
      expect(renderer.renderSparkline(data)).toBe('Empty: ')
    })

    it('should handle flat values', () => {
      const renderer = new DashboardRenderer()
      const data: SparklineData = { values: [5, 5, 5], label: 'Flat' }
      const output = renderer.renderSparkline(data)
      expect(output).toContain('Flat:')
    })
  })

  // ─── renderGauge ───

  describe('renderGauge', () => {
    it('should render a gauge with percentage', () => {
      const renderer = new DashboardRenderer({ width: 50 })
      const data: GaugeData = {
        value: 75, max: 100, label: 'Score',
        thresholds: [{ value: 50, color: 'green' }, { value: 80, color: 'yellow' }],
      }
      const output = renderer.renderGauge(data)
      expect(output).toContain('Score:')
      expect(output).toContain('75%')
    })

    it('should clamp ratio above max to 1', () => {
      const renderer = new DashboardRenderer({ width: 50 })
      const data: GaugeData = {
        value: 200, max: 100, label: 'Over',
        thresholds: [{ value: 0, color: 'green' }],
      }
      const output = renderer.renderGauge(data)
      expect(output).toContain('100%')
    })

    it('should handle zero max', () => {
      const renderer = new DashboardRenderer({ width: 50 })
      const data: GaugeData = {
        value: 0, max: 0, label: 'Zero',
        thresholds: [],
      }
      const output = renderer.renderGauge(data)
      expect(output).toContain('0%')
    })
  })

  // ─── renderSummary ───

  describe('renderSummary', () => {
    it('should render summary items with status markers', () => {
      const renderer = new DashboardRenderer({ width: 80 })
      const data: SummaryData = {
        items: [
          { label: 'Tests', value: '100', status: 'good' },
          { label: 'Errors', value: '5', status: 'error' },
          { label: 'Warnings', value: '3', status: 'warning' },
          { label: 'Unknown', value: '0' },
        ],
      }
      const output = renderer.renderSummary(data)
      expect(output).toContain('[OK]')
      expect(output).toContain('[XX]')
      expect(output).toContain('[!!]')
      expect(output).toContain('[--]')
    })
  })

  // ─── renderList ───

  describe('renderList', () => {
    it('should render items as a bullet list', () => {
      const renderer = new DashboardRenderer()
      const output = renderer.renderList(['item1', 'item2'])
      expect(output).toBe('  - item1\n  - item2')
    })
  })

  // ─── renderKeyValue ───

  describe('renderKeyValue', () => {
    it('should render key and value with dots', () => {
      const renderer = new DashboardRenderer({ width: 20 })
      const output = renderer.renderKeyValue('Key', 'Val')
      expect(output).toContain('Key')
      expect(output).toContain('Val')
      expect(output).toContain('.')
    })
  })

  // ─── fitWidth ───

  describe('fitWidth', () => {
    it('should center text', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      const result = renderer.fitWidth('hi', 'center')
      expect(result.length).toBe(10)
    })

    it('should right-align text', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      const result = renderer.fitWidth('hi', 'right')
      expect(result.length).toBe(10)
      expect(result.startsWith(' ')).toBe(true)
    })

    it('should left-align text', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      const result = renderer.fitWidth('hi', 'left')
      expect(result.startsWith('hi')).toBe(true)
    })

    it('should truncate text that exceeds width', () => {
      const renderer = new DashboardRenderer({ width: 5 })
      const result = renderer.fitWidth('abcdefghij', 'left')
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })

  // ─── wrapText ───

  describe('wrapText', () => {
    it('should wrap text to config width', () => {
      const renderer = new DashboardRenderer({ width: 10 })
      const lines = renderer.wrapText('hello world this is a test')
      expect(lines.length).toBeGreaterThan(1)
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(10)
      }
    })

    it('should return single line for short text', () => {
      const renderer = new DashboardRenderer({ width: 80 })
      const lines = renderer.wrapText('short')
      expect(lines).toEqual(['short'])
    })
  })

  // ─── render (full dashboard) ───

  describe('render', () => {
    it('should render a complete dashboard', () => {
      const renderer = new DashboardRenderer({ width: 60 })
      const data: DashboardData = {
        title: 'Test Dashboard',
        sections: [
          { title: 'Summary', type: 'summary', data: { items: [{ label: 'Total', value: '42', status: 'good' }] } },
          { title: 'Items', type: 'list', data: ['item1', 'item2'] },
        ],
        footer: 'Generated at test time',
      }
      const output = renderer.render(data)
      expect(output).toContain('Test Dashboard')
      expect(output).toContain('Summary')
      expect(output).toContain('Items')
      expect(output).toContain('Generated at test time')
    })

    it('should render without footer', () => {
      const renderer = new DashboardRenderer({ width: 60 })
      const data: DashboardData = {
        title: 'No Footer',
        sections: [],
      }
      const output = renderer.render(data)
      expect(output).toContain('No Footer')
      expect(output).not.toContain('Generated')
    })
  })
})
