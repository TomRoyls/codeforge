import { CliTable } from '../src/core/cli-table/cli-table.js'
import { TableFormatter } from '../src/core/cli-table/table-formatter.js'

// ─── CliTable Constructor ──────────────────────────────────────────────

describe('CliTable', () => {
  describe('constructor', () => {
    it('creates an empty table with defaults', () => {
      const table = new CliTable()
      expect(table.getRowCount()).toBe(0)
      expect(table.getColumnCount()).toBe(0)
    })

    it('creates a table with columns', () => {
      const table = new CliTable([
        { header: 'Name', maxWidth: 20, minWidth: 1 },
        { header: 'Age', maxWidth: 10, minWidth: 1 },
      ])
      expect(table.getColumnCount()).toBe(2)
      expect(table.getRowCount()).toBe(0)
    })

    it('creates a table with partial config', () => {
      const table = new CliTable(undefined, { borderStyle: 'double', padding: 2 })
      const rendered = table.render()
      expect(rendered).toBe('')
    })

    it('creates a table with full config override', () => {
      const table = new CliTable(undefined, {
        borderStyle: 'rounded',
        showHeader: false,
        showRowSeparator: true,
        padding: 0,
        truncate: false,
      })
      expect(table.getRowCount()).toBe(0)
    })
  })

  // ─── setColumns ──────────────────────────────────────────────────────

  describe('setColumns', () => {
    it('sets columns on an initially empty table', () => {
      const table = new CliTable()
      table.setColumns([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      expect(table.getColumnCount()).toBe(1)
    })

    it('replaces existing columns', () => {
      const table = new CliTable([{ header: 'Old', maxWidth: 10, minWidth: 1 }])
      table.setColumns([
        { header: 'New1', maxWidth: 10, minWidth: 1 },
        { header: 'New2', maxWidth: 10, minWidth: 1 },
      ])
      expect(table.getColumnCount()).toBe(2)
    })
  })

  // ─── addRow ──────────────────────────────────────────────────────────

  describe('addRow', () => {
    it('adds a single row', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow(['value'])
      expect(table.getRowCount()).toBe(1)
    })

    it('adds multiple rows sequentially', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow(['a'])
      table.addRow(['b'])
      table.addRow(['c'])
      expect(table.getRowCount()).toBe(3)
    })

    it('adds a row with empty string', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow([''])
      expect(table.getRowCount()).toBe(1)
    })
  })

  // ─── addRows ─────────────────────────────────────────────────────────

  describe('addRows', () => {
    it('adds multiple rows at once', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRows([['a'], ['b'], ['c']])
      expect(table.getRowCount()).toBe(3)
    })

    it('adds an empty array of rows', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRows([])
      expect(table.getRowCount()).toBe(0)
    })

    it('adds rows after existing rows', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow(['first'])
      table.addRows([['second'], ['third']])
      expect(table.getRowCount()).toBe(3)
    })
  })

  // ─── setConfig ───────────────────────────────────────────────────────

  describe('setConfig', () => {
    it('updates a single config property', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.setConfig({ padding: 3 })
      const output = table.render()
      expect(output).toContain('A')
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThanOrEqual(3)
    })

    it('merges config without replacing unset properties', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.setConfig({ borderStyle: 'none' })
      const output = table.render()
      expect(output).not.toContain('┌')
    })

    it('allows switching border style after construction', () => {
      const table = new CliTable(
        [{ header: 'X', maxWidth: 10, minWidth: 1 }],
        { borderStyle: 'single' },
      )
      table.setConfig({ borderStyle: 'double' })
      const output = table.render()
      expect(output).toContain('╔')
    })
  })

  // ─── getRowCount ─────────────────────────────────────────────────────

  describe('getRowCount', () => {
    it('returns 0 for new table', () => {
      const table = new CliTable()
      expect(table.getRowCount()).toBe(0)
    })

    it('returns count after adding rows', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRow(['x'])
      table.addRow(['y'])
      expect(table.getRowCount()).toBe(2)
    })

    it('returns 0 after clear', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRow(['x'])
      table.clear()
      expect(table.getRowCount()).toBe(0)
    })
  })

  // ─── getColumnCount ──────────────────────────────────────────────────

  describe('getColumnCount', () => {
    it('returns 0 for empty table', () => {
      expect(new CliTable().getColumnCount()).toBe(0)
    })

    it('returns number of columns provided in constructor', () => {
      const table = new CliTable([
        { header: 'A', maxWidth: 10, minWidth: 1 },
        { header: 'B', maxWidth: 10, minWidth: 1 },
        { header: 'C', maxWidth: 10, minWidth: 1 },
      ])
      expect(table.getColumnCount()).toBe(3)
    })

    it('updates after setColumns', () => {
      const table = new CliTable()
      table.setColumns([
        { header: 'A', maxWidth: 10, minWidth: 1 },
        { header: 'B', maxWidth: 10, minWidth: 1 },
      ])
      expect(table.getColumnCount()).toBe(2)
    })
  })

  // ─── clear ───────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all rows', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRows([['x'], ['y'], ['z']])
      table.clear()
      expect(table.getRowCount()).toBe(0)
    })

    it('does not remove columns', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRow(['x'])
      table.clear()
      expect(table.getColumnCount()).toBe(1)
    })

    it('allows adding rows after clear', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRow(['before'])
      table.clear()
      table.addRow(['after'])
      expect(table.getRowCount()).toBe(1)
    })
  })

  // ─── render ──────────────────────────────────────────────────────────

  describe('render', () => {
    it('returns empty string with no columns', () => {
      const table = new CliTable()
      expect(table.render()).toBe('')
    })

    it('renders a table with single column and no rows', () => {
      const table = new CliTable([{ header: 'Name', maxWidth: 20, minWidth: 1 }])
      const output = table.render()
      expect(output).toContain('Name')
      expect(output).toContain('┌')
      expect(output).toContain('┐')
      expect(output).toContain('└')
      expect(output).toContain('┘')
    })

    it('renders data rows', () => {
      const table = new CliTable([
        { header: 'Name', maxWidth: 20, minWidth: 1 },
        { header: 'Age', maxWidth: 10, minWidth: 1 },
      ])
      table.addRow(['Alice', '30'])
      table.addRow(['Bob', '25'])
      const output = table.render()
      expect(output).toContain('Alice')
      expect(output).toContain('Bob')
      expect(output).toContain('30')
      expect(output).toContain('25')
    })

    it('renders lines separated by newlines', () => {
      const table = new CliTable([{ header: 'X', maxWidth: 10, minWidth: 1 }])
      const output = table.render()
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThanOrEqual(3)
    })

    it('renders with showHeader false', () => {
      const table = new CliTable(
        [{ header: 'Name', maxWidth: 20, minWidth: 1 }],
        { showHeader: false },
      )
      table.addRow(['Alice'])
      const output = table.render()
      expect(output).not.toContain('Name')
      expect(output).toContain('Alice')
    })

    it('renders with showRowSeparator true', () => {
      const table = new CliTable(
        [{ header: 'Val', maxWidth: 10, minWidth: 1 }],
        { showRowSeparator: true },
      )
      table.addRow(['a'])
      table.addRow(['b'])
      const output = table.render()
      const lines = output.split('\n')
      expect(lines.length).toBe(7)
    })

    it('renders with showRowSeparator false (default)', () => {
      const table = new CliTable([{ header: 'Val', maxWidth: 10, minWidth: 1 }])
      table.addRow(['a'])
      table.addRow(['b'])
      const output = table.render()
      const lines = output.split('\n')
      expect(lines.length).toBe(6)
    })

    it('handles rows with fewer cells than columns', () => {
      const table = new CliTable([
        { header: 'A', maxWidth: 10, minWidth: 1 },
        { header: 'B', maxWidth: 10, minWidth: 1 },
      ])
      table.addRow(['only-one'])
      const output = table.render()
      expect(output).toContain('only-one')
    })

    it('handles empty rows', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow([])
      const output = table.render()
      const lines = output.split('\n')
      expect(lines.length).toBe(5)
    })

    it('renders with different padding values', () => {
      const table = new CliTable(
        [{ header: 'X', maxWidth: 10, minWidth: 1 }],
        { padding: 0 },
      )
      const output = table.render()
      expect(output).toContain('X')
    })

    it('renders with truncate false', () => {
      const table = new CliTable(
        [{ header: 'Short', maxWidth: 5, minWidth: 1 }],
        { truncate: false },
      )
      table.addRow(['VeryLongContent'])
      const output = table.render()
      expect(output).toContain('VeryLongContent')
    })

    it('renders with truncate true (default)', () => {
      const table = new CliTable([{ header: 'Short', maxWidth: 5, minWidth: 1 }])
      table.addRow(['VeryLongContent'])
      const output = table.render()
      expect(output).not.toContain('VeryLongContent')
      expect(output).toContain('...')
    })

    it('renders with none border style', () => {
      const table = new CliTable(
        [{ header: 'A', maxWidth: 10, minWidth: 1 }],
        { borderStyle: 'none' },
      )
      table.addRow(['val'])
      const output = table.render()
      expect(output).not.toContain('┌')
      expect(output).not.toContain('─')
      expect(output).toContain('A')
      expect(output).toContain('val')
    })

    it('renders with double border style', () => {
      const table = new CliTable(
        [{ header: 'A', maxWidth: 10, minWidth: 1 }],
        { borderStyle: 'double' },
      )
      const output = table.render()
      expect(output).toContain('╔')
      expect(output).toContain('╗')
      expect(output).toContain('╚')
      expect(output).toContain('╝')
      expect(output).toContain('═')
    })

    it('renders with rounded border style', () => {
      const table = new CliTable(
        [{ header: 'A', maxWidth: 10, minWidth: 1 }],
        { borderStyle: 'rounded' },
      )
      const output = table.render()
      expect(output).toContain('╭')
      expect(output).toContain('╮')
      expect(output).toContain('╰')
      expect(output).toContain('╯')
    })

    it('renders a multi-column table', () => {
      const table = new CliTable([
        { header: 'ID', maxWidth: 5, minWidth: 1 },
        { header: 'Name', maxWidth: 20, minWidth: 1 },
        { header: 'Email', maxWidth: 30, minWidth: 1 },
      ])
      table.addRow(['1', 'Alice', 'alice@example.com'])
      table.addRow(['2', 'Bob', 'bob@example.com'])
      const output = table.render()
      expect(output).toContain('Alice')
      expect(output).toContain('bob@example.com')
      expect(output).toContain('│')
    })
  })

  // ─── toString ────────────────────────────────────────────────────────

  describe('toString', () => {
    it('returns the same as render', () => {
      const table = new CliTable([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      table.addRow(['val'])
      expect(table.toString()).toBe(table.render())
    })
  })

  // ─── Edge Cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('render after clear and re-add produces fresh output', () => {
      const table = new CliTable([{ header: 'A', maxWidth: 10, minWidth: 1 }])
      table.addRow(['old'])
      table.clear()
      table.addRow(['new'])
      const output = table.render()
      expect(output).toContain('new')
      expect(output).not.toContain('old')
    })

    it('setColumns after adding rows still renders correctly', () => {
      const table = new CliTable()
      table.addRow(['orphan'])
      table.setColumns([{ header: 'Col', maxWidth: 10, minWidth: 1 }])
      const output = table.render()
      expect(output).toContain('orphan')
    })

    it('renders table with alignment right', () => {
      const table = new CliTable([
        { header: 'Price', maxWidth: 10, minWidth: 1, alignment: 'right' },
      ])
      table.addRow(['42'])
      const output = table.render()
      expect(output).toContain('42')
    })

    it('renders table with alignment center', () => {
      const table = new CliTable([
        { header: 'Title', maxWidth: 20, minWidth: 1, alignment: 'center' },
      ])
      table.addRow(['Hello'])
      const output = table.render()
      expect(output).toContain('Hello')
    })

    it('column with fixed width overrides measured width', () => {
      const table = new CliTable([
        { header: 'A', width: 8, maxWidth: 20, minWidth: 1 },
      ])
      table.addRow(['VeryLongValue'])
      const output = table.render()
      expect(output).not.toContain('VeryLongValue')
    })

    it('handles large padding', () => {
      const table = new CliTable(
        [{ header: 'X', maxWidth: 10, minWidth: 1 }],
        { padding: 5 },
      )
      const output = table.render()
      expect(output).toContain('X')
    })

    it('render with no rows still shows header and borders', () => {
      const table = new CliTable([{ header: 'Only', maxWidth: 10, minWidth: 1 }])
      const output = table.render()
      expect(output).toContain('Only')
      expect(output).toContain('┌')
      expect(output).toContain('└')
    })
  })
})

// ─── TableFormatter ────────────────────────────────────────────────────

describe('TableFormatter', () => {
  // ─── getBorderChars ──────────────────────────────────────────────────

  describe('static getBorderChars', () => {
    it('returns none border chars', () => {
      const chars = TableFormatter.getBorderChars('none')
      expect(chars.topLeft).toBe('')
      expect(chars.topRight).toBe('')
      expect(chars.vertical).toBe('')
      expect(chars.left).toBe('')
      expect(chars.right).toBe('')
      expect(chars.topHorizontal).toBe('')
    })

    it('returns single border chars', () => {
      const chars = TableFormatter.getBorderChars('single')
      expect(chars.topLeft).toBe('┌')
      expect(chars.topRight).toBe('┐')
      expect(chars.topMid).toBe('┬')
      expect(chars.topHorizontal).toBe('─')
      expect(chars.midLeft).toBe('├')
      expect(chars.midRight).toBe('┤')
      expect(chars.midMid).toBe('┼')
      expect(chars.midHorizontal).toBe('─')
      expect(chars.bottomLeft).toBe('└')
      expect(chars.bottomRight).toBe('┘')
      expect(chars.bottomMid).toBe('┴')
      expect(chars.bottomHorizontal).toBe('─')
      expect(chars.vertical).toBe('│')
      expect(chars.left).toBe('│')
      expect(chars.right).toBe('│')
    })

    it('returns double border chars', () => {
      const chars = TableFormatter.getBorderChars('double')
      expect(chars.topLeft).toBe('╔')
      expect(chars.topRight).toBe('╗')
      expect(chars.topMid).toBe('╦')
      expect(chars.topHorizontal).toBe('═')
      expect(chars.midLeft).toBe('╠')
      expect(chars.midRight).toBe('╣')
      expect(chars.midMid).toBe('╬')
      expect(chars.midHorizontal).toBe('═')
      expect(chars.bottomLeft).toBe('╚')
      expect(chars.bottomRight).toBe('╝')
      expect(chars.bottomMid).toBe('╩')
      expect(chars.bottomHorizontal).toBe('═')
      expect(chars.vertical).toBe('║')
      expect(chars.left).toBe('║')
      expect(chars.right).toBe('║')
    })

    it('returns rounded border chars', () => {
      const chars = TableFormatter.getBorderChars('rounded')
      expect(chars.topLeft).toBe('╭')
      expect(chars.topRight).toBe('╮')
      expect(chars.bottomLeft).toBe('╰')
      expect(chars.bottomRight).toBe('╯')
      expect(chars.topHorizontal).toBe('─')
      expect(chars.midHorizontal).toBe('─')
      expect(chars.bottomHorizontal).toBe('─')
    })
  })

  // ─── formatCell ──────────────────────────────────────────────────────

  describe('formatCell', () => {
    const formatter = new TableFormatter()

    it('formats a left-aligned cell', () => {
      const result = formatter.formatCell('hi', 6, 'left', 1)
      expect(result).toBe(' hi     ')
    })

    it('formats a right-aligned cell', () => {
      const result = formatter.formatCell('hi', 6, 'right', 1)
      expect(result).toBe('     hi ')
    })

    it('formats a center-aligned cell', () => {
      const result = formatter.formatCell('hi', 6, 'center', 1)
      expect(result).toBe('   hi   ')
    })

    it('formats cell with zero padding', () => {
      const result = formatter.formatCell('abc', 5, 'left', 0)
      expect(result).toBe('abc  ')
    })

    it('truncates content that exceeds width', () => {
      const result = formatter.formatCell('longtext', 4, 'left', 0)
      expect(result).toBe('long')
    })

    it('handles empty content', () => {
      const result = formatter.formatCell('', 5, 'left', 0)
      expect(result).toBe('     ')
    })

    it('handles exact width content', () => {
      const result = formatter.formatCell('12345', 5, 'left', 0)
      expect(result).toBe('12345')
    })

    it('center-aligns with odd leftover space', () => {
      const result = formatter.formatCell('ab', 5, 'center', 0)
      expect(result).toBe(' ab  ')
    })
  })

  // ─── formatRow ───────────────────────────────────────────────────────

  describe('formatRow', () => {
    const formatter = new TableFormatter()

    it('formats a row with single cell and single border', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatRow([' hello '], border)
      expect(result).toBe('│ hello │')
    })

    it('formats a row with multiple cells', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatRow([' a ', ' b '], border)
      expect(result).toBe('│ a │ b │')
    })

    it('formats a row with none border (space separator)', () => {
      const border = TableFormatter.getBorderChars('none')
      const result = formatter.formatRow(['a', 'b'], border)
      expect(result).toBe('a b')
    })

    it('formats a row with double border', () => {
      const border = TableFormatter.getBorderChars('double')
      const result = formatter.formatRow(['x'], border)
      expect(result).toBe('║x║')
    })
  })

  // ─── formatSeparator ─────────────────────────────────────────────────

  describe('formatSeparator', () => {
    const formatter = new TableFormatter()

    it('returns empty string for none border', () => {
      const border = TableFormatter.getBorderChars('none')
      const result = formatter.formatSeparator(border, [5, 10], 1)
      expect(result).toBe('')
    })

    it('formats a separator with single border', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatSeparator(border, [3, 5], 1)
      expect(result).toContain('├')
      expect(result).toContain('┤')
      expect(result).toContain('┼')
    })

    it('formats a separator with single width', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatSeparator(border, [4], 0)
      expect(result).toBe('├────┤')
    })

    it('formats a separator with double border', () => {
      const border = TableFormatter.getBorderChars('double')
      const result = formatter.formatSeparator(border, [3], 1)
      expect(result).toBe('╠═════╣')
    })
  })

  // ─── truncate ────────────────────────────────────────────────────────

  describe('truncate', () => {
    const formatter = new TableFormatter()

    it('returns text unchanged if shorter than maxWidth', () => {
      expect(formatter.truncate('hello', 10)).toBe('hello')
    })

    it('returns text unchanged if equal to maxWidth', () => {
      expect(formatter.truncate('hello', 5)).toBe('hello')
    })

    it('truncates and adds ellipsis for long text', () => {
      expect(formatter.truncate('hello world', 8)).toBe('hello...')
    })

    it('handles maxWidth less than 3 (no ellipsis)', () => {
      expect(formatter.truncate('hello', 2)).toBe('he')
    })

    it('handles maxWidth of exactly 3', () => {
      expect(formatter.truncate('hello', 3)).toBe('...')
    })

    it('handles empty text', () => {
      expect(formatter.truncate('', 5)).toBe('')
    })

    it('handles maxWidth of 0', () => {
      expect(formatter.truncate('hello', 0)).toBe('')
    })

    it('handles maxWidth of 1', () => {
      expect(formatter.truncate('hello', 1)).toBe('h')
    })
  })

  // ─── measureWidths ───────────────────────────────────────────────────

  describe('measureWidths', () => {
    const formatter = new TableFormatter()

    it('uses fixed width when specified', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'A', width: 8, maxWidth: 20, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(['A'], [], configs)
      expect(widths[0]).toBe(8)
    })

    it('uses header length when no rows and no fixed width', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'Header', maxWidth: 50, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(['Header'], [], configs)
      expect(widths[0]).toBe(6)
    })

    it('uses max row content length when wider than header', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'A', maxWidth: 50, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(['A'], [['LongerValue']], configs)
      expect(widths[0]).toBe(11)
    })

    it('clamps width to maxWidth', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'A', maxWidth: 5, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(['A'], [['VeryLongContent']], configs)
      expect(widths[0]).toBe(5)
    })

    it('clamps width to minWidth', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: '', maxWidth: 50, minWidth: 10 },
      ]
      const widths = formatter.measureWidths([''], [['a']], configs)
      expect(widths[0]).toBe(10)
    })

    it('returns header length when config is missing', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = []
      const widths = formatter.measureWidths(['Hello'], [], configs)
      expect(widths[0]).toBe(5)
    })

    it('handles multiple columns independently', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'Short', maxWidth: 50, minWidth: 1 },
        { header: 'LongHeaderName', maxWidth: 50, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(
        ['Short', 'LongHeaderName'],
        [['abc', 'def']],
        configs,
      )
      expect(widths[0]).toBe(5)
      expect(widths[1]).toBe(14)
    })

    it('fixed width is bounded by min and max', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'A', width: 3, maxWidth: 5, minWidth: 4 },
      ]
      const widths = formatter.measureWidths(['A'], [], configs)
      expect(widths[0]).toBe(4)
    })

    it('fixed width is clamped by maxWidth', () => {
      const configs: Array<import('../src/core/cli-table/types.js').ColumnConfig> = [
        { header: 'A', width: 100, maxWidth: 10, minWidth: 1 },
      ]
      const widths = formatter.measureWidths(['A'], [], configs)
      expect(widths[0]).toBe(10)
    })
  })
})
