import { describe, it, expect } from 'vitest'
import { TextFormatter } from '../../src/core/renderer/text-formatter.js'
import { TableRenderer } from '../../src/core/renderer/table-renderer.js'
import { ProgressTracker } from '../../src/core/renderer/progress-tracker.js'
import type { TableColumn, TableRow, TableConfig, TextStyle } from '../../src/core/renderer/types.js'
import { DEFAULT_TABLE_CONFIG, DEFAULT_TEXT_STYLE, DEFAULT_PROGRESS_CONFIG } from '../../src/core/renderer/types.js'

const ESC = '\x1b['

describe('TextFormatter', () => {
  const formatter = new TextFormatter()

  describe('format', () => {
    it('should apply bold style', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, bold: true })
      expect(result).toBe(`${ESC}1mhello${ESC}0m`)
    })

    it('should apply italic style', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, italic: true })
      expect(result).toBe(`${ESC}3mhello${ESC}0m`)
    })

    it('should apply underline style', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, underline: true })
      expect(result).toBe(`${ESC}4mhello${ESC}0m`)
    })

    it('should apply dim style', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, dim: true })
      expect(result).toBe(`${ESC}2mhello${ESC}0m`)
    })

    it('should apply color', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, color: 'red' })
      expect(result).toBe(`${ESC}31mhello${ESC}0m`)
    })

    it('should apply background color', () => {
      const result = formatter.format('hello', { ...DEFAULT_TEXT_STYLE, bg: 'red' })
      expect(result).toBe(`${ESC}41mhello${ESC}0m`)
    })

    it('should apply multiple styles at once', () => {
      const result = formatter.format('hello', {
        ...DEFAULT_TEXT_STYLE,
        bold: true,
        color: 'green',
        bg: 'yellow',
      })
      expect(result).toBe(`${ESC}1;32;43mhello${ESC}0m`)
    })

    it('should return unstyled text when no styles are active', () => {
      const result = formatter.format('hello', DEFAULT_TEXT_STYLE)
      expect(result).toBe('hello')
    })

    it('should apply all styles combined', () => {
      const style: TextStyle = {
        bold: true,
        italic: true,
        underline: true,
        dim: true,
        color: 'cyan',
        bg: 'magenta',
      }
      const result = formatter.format('test', style)
      expect(result).toBe(`${ESC}1;3;4;2;36;45mtest${ESC}0m`)
    })
  })

  describe('bold', () => {
    it('should wrap text in bold ANSI codes', () => {
      expect(formatter.bold('hello')).toBe(`${ESC}1mhello${ESC}0m`)
    })
  })

  describe('dim', () => {
    it('should wrap text in dim ANSI codes', () => {
      expect(formatter.dim('hello')).toBe(`${ESC}2mhello${ESC}0m`)
    })
  })

  describe('colorize', () => {
    it('should apply red color', () => {
      expect(formatter.colorize('hello', 'red')).toBe(`${ESC}31mhello${ESC}0m`)
    })

    it('should apply green color', () => {
      expect(formatter.colorize('hello', 'green')).toBe(`${ESC}32mhello${ESC}0m`)
    })

    it('should apply yellow color', () => {
      expect(formatter.colorize('hello', 'yellow')).toBe(`${ESC}33mhello${ESC}0m`)
    })

    it('should apply blue color', () => {
      expect(formatter.colorize('hello', 'blue')).toBe(`${ESC}34mhello${ESC}0m`)
    })

    it('should apply magenta color', () => {
      expect(formatter.colorize('hello', 'magenta')).toBe(`${ESC}35mhello${ESC}0m`)
    })

    it('should apply cyan color', () => {
      expect(formatter.colorize('hello', 'cyan')).toBe(`${ESC}36mhello${ESC}0m`)
    })

    it('should apply white color', () => {
      expect(formatter.colorize('hello', 'white')).toBe(`${ESC}37mhello${ESC}0m`)
    })

    it('should apply gray color', () => {
      expect(formatter.colorize('hello', 'gray')).toBe(`${ESC}90mhello${ESC}0m`)
    })
  })

  describe('stripColors', () => {
    it('should remove ANSI escape codes', () => {
      const colored = `${ESC}1;31mhello${ESC}0m world`
      expect(formatter.stripColors(colored)).toBe('hello world')
    })

    it('should handle text without colors', () => {
      expect(formatter.stripColors('plain text')).toBe('plain text')
    })

    it('should handle complex ANSI sequences', () => {
      const text = `${ESC}1;3;4;31;42mcomplex${ESC}0m`
      expect(formatter.stripColors(text)).toBe('complex')
    })
  })

  describe('wordWrap', () => {
    it('should wrap text at maxWidth', () => {
      const result = formatter.wordWrap('hello world foo bar', 12)
      expect(result).toBe('hello world\nfoo bar')
    })

    it('should not wrap text shorter than maxWidth', () => {
      const result = formatter.wordWrap('hello', 10)
      expect(result).toBe('hello')
    })

    it('should preserve existing newlines', () => {
      const result = formatter.wordWrap('hello\nworld', 10)
      expect(result).toBe('hello\nworld')
    })

    it('should handle empty string', () => {
      expect(formatter.wordWrap('', 10)).toBe('')
    })

    it('should return text unchanged for maxWidth 0', () => {
      expect(formatter.wordWrap('hello', 0)).toBe('hello')
    })

    it('should handle single long word exceeding maxWidth', () => {
      const result = formatter.wordWrap('superlongword', 5)
      expect(result).toBe('superlongword')
    })
  })

  describe('indent', () => {
    it('should indent all lines', () => {
      const result = formatter.indent('hello\nworld', '  ')
      expect(result).toBe('  hello\n  world')
    })

    it('should indent single line', () => {
      expect(formatter.indent('hello', '    ')).toBe('    hello')
    })

    it('should handle empty string', () => {
      expect(formatter.indent('', '  ')).toBe('  ')
    })
  })

  describe('center', () => {
    it('should center text within width', () => {
      const result = formatter.center('hi', 10)
      expect(result).toBe('    hi    ')
    })

    it('should handle odd padding', () => {
      const result = formatter.center('hi', 9)
      expect(result).toBe('   hi    ')
    })

    it('should return unchanged if text is wider', () => {
      expect(formatter.center('hello', 3)).toBe('hello')
    })

    it('should handle colored text by measuring visible length', () => {
      const colored = `${ESC}1mhi${ESC}0m`
      const result = formatter.center(colored, 10)
      expect(result).toBe('    ' + colored + '    ')
    })
  })

  describe('truncate', () => {
    it('should truncate text with default suffix', () => {
      expect(formatter.truncate('hello world', 8)).toBe('hello...')
    })

    it('should not truncate text shorter than maxWidth', () => {
      expect(formatter.truncate('hi', 10)).toBe('hi')
    })

    it('should use custom suffix', () => {
      expect(formatter.truncate('hello world', 8, '…')).toBe('hello w…')
    })

    it('should handle maxWidth equal to text length', () => {
      expect(formatter.truncate('hello', 5)).toBe('hello')
    })

    it('should handle maxWidth smaller than suffix length', () => {
      expect(formatter.truncate('hello', 2)).toBe('he')
    })
  })

  describe('pluralize', () => {
    it('should return singular for count 1', () => {
      expect(formatter.pluralize(1, 'file')).toBe('1 file')
    })

    it('should return plural for count 0', () => {
      expect(formatter.pluralize(0, 'file')).toBe('0 files')
    })

    it('should return plural for count > 1', () => {
      expect(formatter.pluralize(5, 'file')).toBe('5 files')
    })

    it('should use custom plural form', () => {
      expect(formatter.pluralize(2, 'mouse', 'mice')).toBe('2 mice')
    })

    it('should use singular with custom plural for count 1', () => {
      expect(formatter.pluralize(1, 'mouse', 'mice')).toBe('1 mouse')
    })
  })
})

describe('TableRenderer', () => {
  const renderer = new TableRenderer()

  const basicColumns: TableColumn[] = [
    { key: 'name', header: 'Name', align: 'left', sortable: true },
    { key: 'age', header: 'Age', align: 'right', sortable: true },
    { key: 'city', header: 'City', align: 'center', sortable: false },
  ]

  const basicRows: TableRow[] = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
  ]

  describe('render', () => {
    it('should render a complete table with borders', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
        showBorders: true,
      }
      const result = renderer.render(basicRows, config)
      const lines = result.split('\n')
      expect(lines.length).toBe(5)
      expect(lines[0]).toContain('Name')
      expect(lines[0]).toContain('Age')
      expect(lines[0]).toContain('City')
      expect(lines[1]).toContain('─')
      expect(lines[2]).toContain('Alice')
    })

    it('should render table without borders', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
        showBorders: false,
      }
      const result = renderer.render(basicRows, config)
      expect(result).not.toContain('│')
      expect(result).not.toContain('├')
    })

    it('should render table without header', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
        showHeader: false,
      }
      const result = renderer.render(basicRows, config)
      expect(result).not.toContain('Name')
      expect(result).toContain('Alice')
    })

    it('should render with row numbers', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
        showRowNumbers: true,
      }
      const result = renderer.render(basicRows, config)
      expect(result).toContain('  1')
      expect(result).toContain('  2')
      expect(result).toContain('  3')
    })

    it('should sort rows when sortBy is provided', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
        sortBy: { key: 'age', direction: 'asc' },
      }
      const result = renderer.render(basicRows, config)
      const lines = result.split('\n')
      expect(lines[2]).toContain('Bob')
      expect(lines[3]).toContain('Alice')
      expect(lines[4]).toContain('Charlie')
    })

    it('should handle empty rows', () => {
      const config: TableConfig = {
        columns: basicColumns,
        ...DEFAULT_TABLE_CONFIG,
      }
      const result = renderer.render([], config)
      const lines = result.split('\n')
      expect(lines.length).toBe(2)
    })
  })

  describe('renderHeader', () => {
    it('should render header with borders', () => {
      const result = renderer.renderHeader(basicColumns, true)
      expect(result).toContain('│')
      expect(result).toContain('Name')
      expect(result).toContain('Age')
      expect(result).toContain('City')
    })

    it('should render header without borders', () => {
      const result = renderer.renderHeader(basicColumns, false)
      expect(result).not.toContain('│')
      expect(result).toContain('Name')
    })
  })

  describe('renderRow', () => {
    it('should render a single row with borders', () => {
      const result = renderer.renderRow(basicRows[0]!, basicColumns, true)
      expect(result).toContain('Alice')
      expect(result).toContain('30')
      expect(result).toContain('NYC')
    })

    it('should render a row without borders', () => {
      const result = renderer.renderRow(basicRows[0]!, basicColumns, false)
      expect(result).not.toContain('│')
      expect(result).toContain('Alice')
    })

    it('should apply format function to values', () => {
      const columns: TableColumn[] = [
        {
          key: 'price',
          header: 'Price',
          align: 'right',
          sortable: false,
          format: (v: unknown) => `$${v}`,
        },
      ]
      const result = renderer.renderRow({ price: 42 }, columns, false)
      expect(result).toContain('$42')
    })

    it('should handle undefined values', () => {
      const columns: TableColumn[] = [
        { key: 'missing', header: 'Missing', align: 'left', sortable: false },
      ]
      const result = renderer.renderRow({}, columns, false)
      const stripped = result.trim()
      expect(stripped).toBe('')
    })
  })

  describe('renderSeparator', () => {
    it('should render separator with horizontal lines', () => {
      const result = renderer.renderSeparator(basicColumns)
      expect(result).toContain('─')
      expect(result).toContain('┼')
      expect(result).toContain('├')
      expect(result).toContain('┤')
    })
  })

  describe('calculateWidths', () => {
    it('should use explicit column widths when provided', () => {
      const columns: TableColumn[] = [
        { key: 'a', header: 'A', width: 10, align: 'left', sortable: false },
        { key: 'b', header: 'B', width: 20, align: 'left', sortable: false },
      ]
      const widths = renderer.calculateWidths(columns, [], 80)
      expect(widths).toEqual([10, 20])
    })

    it('should auto-calculate widths from content', () => {
      const columns: TableColumn[] = [
        { key: 'name', header: 'Name', align: 'left', sortable: false },
      ]
      const rows: TableRow[] = [
        { name: 'Short' },
        { name: 'VeryLongNameHere' },
      ]
      const widths = renderer.calculateWidths(columns, rows, 80)
      expect(widths[0]).toBe('VeryLongNameHere'.length)
    })

    it('should constrain widths to maxWidth', () => {
      const columns: TableColumn[] = [
        { key: 'a', header: 'A', align: 'left', sortable: false },
        { key: 'b', header: 'B', align: 'left', sortable: false },
        { key: 'c', header: 'C', align: 'left', sortable: false },
      ]
      const rows: TableRow[] = [
        { a: 'x'.repeat(50), b: 'y'.repeat(50), c: 'z'.repeat(50) },
      ]
      const widths = renderer.calculateWidths(columns, rows, 40)
      const totalWidth = widths.reduce((s, w) => s + w, 0)
      expect(totalWidth).toBeLessThanOrEqual(40)
    })

    it('should handle empty columns', () => {
      const widths = renderer.calculateWidths([], [], 80)
      expect(widths).toEqual([])
    })
  })

  describe('truncate', () => {
    it('should truncate with ellipsis', () => {
      expect(renderer.truncate('hello world', 8)).toBe('hello...')
    })

    it('should not truncate short text', () => {
      expect(renderer.truncate('hi', 10)).toBe('hi')
    })

    it('should handle width of 3', () => {
      expect(renderer.truncate('hello', 3)).toBe('...')
    })

    it('should handle width less than 3', () => {
      expect(renderer.truncate('hello', 2)).toBe('he')
    })

    it('should handle width of 1', () => {
      expect(renderer.truncate('hello', 1)).toBe('h')
    })
  })

  describe('pad', () => {
    it('should left-align text', () => {
      const result = renderer.pad('hi', 10, 'left')
      expect(result).toBe('hi        ')
    })

    it('should right-align text', () => {
      const result = renderer.pad('hi', 10, 'right')
      expect(result).toBe('        hi')
    })

    it('should center-align text', () => {
      const result = renderer.pad('hi', 10, 'center')
      expect(result).toBe('    hi    ')
    })

    it('should truncate text wider than width', () => {
      const result = renderer.pad('hello world', 5, 'left')
      expect(result).toBe('hello')
    })
  })

  describe('sortRows', () => {
    it('should sort ascending by string key', () => {
      const rows: TableRow[] = [
        { name: 'Charlie' },
        { name: 'Alice' },
        { name: 'Bob' },
      ]
      const sorted = renderer.sortRows(rows, 'name', 'asc')
      expect(sorted[0]!.name).toBe('Alice')
      expect(sorted[1]!.name).toBe('Bob')
      expect(sorted[2]!.name).toBe('Charlie')
    })

    it('should sort descending by string key', () => {
      const rows: TableRow[] = [
        { name: 'Alice' },
        { name: 'Charlie' },
        { name: 'Bob' },
      ]
      const sorted = renderer.sortRows(rows, 'name', 'desc')
      expect(sorted[0]!.name).toBe('Charlie')
      expect(sorted[2]!.name).toBe('Alice')
    })

    it('should sort numerically', () => {
      const rows: TableRow[] = [
        { val: 30 },
        { val: 10 },
        { val: 20 },
      ]
      const sorted = renderer.sortRows(rows, 'val', 'asc')
      expect(sorted[0]!.val).toBe(10)
      expect(sorted[2]!.val).toBe(30)
    })

    it('should not mutate original array', () => {
      const rows: TableRow[] = [
        { name: 'C' },
        { name: 'A' },
        { name: 'B' },
      ]
      renderer.sortRows(rows, 'name', 'asc')
      expect(rows[0]!.name).toBe('C')
    })

    it('should handle undefined values', () => {
      const rows: TableRow[] = [
        { name: 'Bob' },
        {},
        { name: 'Alice' },
      ]
      const sorted = renderer.sortRows(rows, 'name', 'asc')
      expect(sorted[2]!.name).toBe('Bob')
    })
  })
})

describe('ProgressTracker', () => {
  it('should start with zero progress', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    const state = tracker.getState()
    expect(state.current).toBe(0)
    expect(state.total).toBe(100)
    expect(state.percent).toBe(0)
  })

  it('should update progress by increment', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.update(25)
    expect(tracker.getState().current).toBe(25)
    expect(tracker.getState().percent).toBe(25)
  })

  it('should accumulate multiple updates', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.update(30)
    tracker.update(20)
    expect(tracker.getState().current).toBe(50)
    expect(tracker.getState().percent).toBe(50)
  })

  it('should not exceed total with update', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.update(150)
    expect(tracker.getState().current).toBe(100)
  })

  it('should set progress directly', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(75)
    expect(tracker.getState().current).toBe(75)
    expect(tracker.getState().percent).toBe(75)
  })

  it('should clamp setProgress to total', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(200)
    expect(tracker.getState().current).toBe(100)
  })

  it('should clamp setProgress to 0 minimum', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(-5)
    expect(tracker.getState().current).toBe(0)
  })

  it('should return default state when not started', () => {
    const tracker = new ProgressTracker()
    const state = tracker.getState()
    expect(state.current).toBe(0)
    expect(state.total).toBe(0)
    expect(state.percent).toBe(0)
    expect(state.elapsed).toBe(0)
    expect(state.eta).toBe(0)
    expect(state.startTime).toBe(0)
  })

  it('should render progress bar', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { showETA: false })
    tracker.setProgress(50)
    const rendered = tracker.render()
    expect(rendered).toContain('█')
    expect(rendered).toContain('░')
    expect(rendered).toContain('50.0%')
    expect(rendered).toContain('50/100')
  })

  it('should render empty bar at zero progress', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { showETA: false })
    const rendered = tracker.render()
    expect(rendered).toContain('░'.repeat(30))
    expect(rendered).toContain('0.0%')
  })

  it('should render full bar at 100%', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { showETA: false })
    tracker.setProgress(100)
    const rendered = tracker.render()
    expect(rendered).toContain('█'.repeat(30))
    expect(rendered).toContain('100.0%')
  })

  it('should respect custom bar width', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { width: 10, showETA: false })
    tracker.setProgress(50)
    const rendered = tracker.render()
    expect(rendered).toContain('█'.repeat(5))
    expect(rendered).toContain('░'.repeat(5))
  })

  it('should respect custom fill and empty chars', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { width: 10, fillChar: '#', emptyChar: '-', showETA: false })
    tracker.setProgress(50)
    const rendered = tracker.render()
    expect(rendered).toContain('#####')
    expect(rendered).toContain('-----')
  })

  it('should hide percent when showPercent is false', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { showPercent: false, showCount: false, showETA: false })
    tracker.setProgress(50)
    const rendered = tracker.render()
    expect(rendered).not.toContain('%')
  })

  it('should hide count when showCount is false', () => {
    const tracker = new ProgressTracker()
    tracker.start(100, { showCount: false, showETA: false })
    tracker.setProgress(50)
    const rendered = tracker.render()
    expect(rendered).not.toContain('50/100')
  })

  it('should detect completion', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    expect(tracker.isComplete()).toBe(false)
    tracker.setProgress(100)
    expect(tracker.isComplete()).toBe(true)
  })

  it('should not be complete when stopped', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(100)
    tracker.stop()
    expect(tracker.isComplete()).toBe(false)
  })

  it('should stop and clear state', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.stop()
    expect(tracker.getState().total).toBe(0)
  })

  it('should return empty string when not started', () => {
    const tracker = new ProgressTracker()
    expect(tracker.render()).toBe('')
  })

  it('should reset progress to zero', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(75)
    tracker.reset()
    expect(tracker.getState().current).toBe(0)
    expect(tracker.getState().percent).toBe(0)
  })

  it('should do nothing on reset when not started', () => {
    const tracker = new ProgressTracker()
    tracker.reset()
    expect(tracker.getState().current).toBe(0)
  })

  it('should not update when not started', () => {
    const tracker = new ProgressTracker()
    tracker.update(10)
    expect(tracker.getState().current).toBe(0)
  })

  it('should not setProgress when not started', () => {
    const tracker = new ProgressTracker()
    tracker.setProgress(50)
    expect(tracker.getState().current).toBe(0)
  })

  it('should accept custom config in start', () => {
    const tracker = new ProgressTracker()
    tracker.start(50, { width: 20, fillChar: '=', emptyChar: '-', showETA: false })
    tracker.setProgress(25)
    const rendered = tracker.render()
    expect(rendered).toContain('==========')
    expect(rendered).toContain('----------')
  })

  it('should calculate ETA for partial progress', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(50)
    const state = tracker.getState()
    expect(state.eta).toBeGreaterThanOrEqual(0)
  })

  it('should set ETA to 0 when complete', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(100)
    expect(tracker.getState().eta).toBe(0)
  })

  it('should render ETA format when progress is partial', () => {
    const tracker = new ProgressTracker()
    tracker.start(100)
    tracker.setProgress(50)
    const rendered = tracker.render()
    if (tracker.getState().eta > 0) {
      expect(rendered).toContain('ETA:')
    } else {
      expect(rendered).toContain('50.0%')
    }
  })
})

describe('Default exports', () => {
  it('should have correct default table config', () => {
    expect(DEFAULT_TABLE_CONFIG.maxWidth).toBe(80)
    expect(DEFAULT_TABLE_CONFIG.showHeader).toBe(true)
    expect(DEFAULT_TABLE_CONFIG.showBorders).toBe(true)
    expect(DEFAULT_TABLE_CONFIG.showRowNumbers).toBe(false)
  })

  it('should have correct default text style', () => {
    expect(DEFAULT_TEXT_STYLE.bold).toBe(false)
    expect(DEFAULT_TEXT_STYLE.italic).toBe(false)
    expect(DEFAULT_TEXT_STYLE.underline).toBe(false)
    expect(DEFAULT_TEXT_STYLE.dim).toBe(false)
    expect(DEFAULT_TEXT_STYLE.color).toBe('white')
  })

  it('should have correct default progress config', () => {
    expect(DEFAULT_PROGRESS_CONFIG.total).toBe(100)
    expect(DEFAULT_PROGRESS_CONFIG.width).toBe(30)
    expect(DEFAULT_PROGRESS_CONFIG.fillChar).toBe('█')
    expect(DEFAULT_PROGRESS_CONFIG.emptyChar).toBe('░')
    expect(DEFAULT_PROGRESS_CONFIG.showPercent).toBe(true)
    expect(DEFAULT_PROGRESS_CONFIG.showCount).toBe(true)
    expect(DEFAULT_PROGRESS_CONFIG.showETA).toBe(true)
  })
})
