import { describe, it, expect } from 'vitest'
import { TableFormatter } from '../../src/core/cli-table/table-formatter.js'
import { CliTable } from '../../src/core/cli-table/cli-table.js'
import type { ColumnConfig, BorderChars } from '../../src/core/cli-table/types.js'

const basicColumns: ColumnConfig[] = [
  { header: 'Name', maxWidth: 50, minWidth: 5 },
  { header: 'Age', alignment: 'right', maxWidth: 50, minWidth: 5 },
  { header: 'City', alignment: 'center', maxWidth: 50, minWidth: 5 },
]

describe('TableFormatter', () => {
  const formatter = new TableFormatter()

  describe('getBorderChars', () => {
    it('should return empty strings for none style', () => {
      const chars = TableFormatter.getBorderChars('none')
      expect(chars.topLeft).toBe('')
      expect(chars.topRight).toBe('')
      expect(chars.vertical).toBe('')
      expect(chars.left).toBe('')
      expect(chars.right).toBe('')
    })

    it('should return single border characters', () => {
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

    it('should return double border characters', () => {
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

    it('should return rounded border characters', () => {
      const chars = TableFormatter.getBorderChars('rounded')
      expect(chars.topLeft).toBe('╭')
      expect(chars.topRight).toBe('╮')
      expect(chars.bottomLeft).toBe('╰')
      expect(chars.bottomRight).toBe('╯')
      expect(chars.topHorizontal).toBe('─')
      expect(chars.vertical).toBe('│')
    })
  })

  describe('formatCell', () => {
    it('should left-align content', () => {
      const result = formatter.formatCell('hi', 10, 'left', 1)
      expect(result).toBe(' hi         ')
    })

    it('should right-align content', () => {
      const result = formatter.formatCell('hi', 10, 'right', 1)
      expect(result).toBe('         hi ')
    })

    it('should center-align content', () => {
      const result = formatter.formatCell('hi', 10, 'center', 1)
      expect(result).toBe('     hi     ')
    })

    it('should apply padding on both sides', () => {
      const result = formatter.formatCell('x', 5, 'left', 2)
      expect(result.startsWith('  ')).toBe(true)
      expect(result.endsWith('  ')).toBe(true)
    })

    it('should handle zero padding', () => {
      const result = formatter.formatCell('hi', 5, 'left', 0)
      expect(result).toBe('hi   ')
    })

    it('should truncate content exceeding width', () => {
      const result = formatter.formatCell('hello world', 5, 'left', 0)
      expect(result).toBe('hello')
    })
  })

  describe('formatRow', () => {
    it('should join cells with border vertical character', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatRow([' a ', ' b ', ' c '], border)
      expect(result).toBe('│ a │ b │ c │')
    })

    it('should join cells with space for none style', () => {
      const border = TableFormatter.getBorderChars('none')
      const result = formatter.formatRow(['a', 'b'], border)
      expect(result).toBe('a b')
    })

    it('should handle single cell', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatRow([' cell '], border)
      expect(result).toBe('│ cell │')
    })
  })

  describe('formatSeparator', () => {
    it('should create separator line for single style', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatSeparator(border, [5, 3], 1)
      expect(result).toBe('├───────┼─────┤')
    })

    it('should return empty string for none style', () => {
      const border = TableFormatter.getBorderChars('none')
      const result = formatter.formatSeparator(border, [5, 3], 1)
      expect(result).toBe('')
    })

    it('should handle single column', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatSeparator(border, [5], 1)
      expect(result).toBe('├───────┤')
    })

    it('should include padding in separator width', () => {
      const border = TableFormatter.getBorderChars('single')
      const result = formatter.formatSeparator(border, [3], 2)
      expect(result).toBe('├───────┤')
    })
  })

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(formatter.truncate('hi', 10)).toBe('hi')
    })

    it('should truncate long text with ellipsis', () => {
      expect(formatter.truncate('hello world', 8)).toBe('hello...')
    })

    it('should not truncate text at exact width', () => {
      expect(formatter.truncate('hello', 5)).toBe('hello')
    })

    it('should handle maxWidth of 3', () => {
      expect(formatter.truncate('hello', 3)).toBe('...')
    })

    it('should handle maxWidth less than 3', () => {
      expect(formatter.truncate('hello', 2)).toBe('he')
    })

    it('should handle maxWidth of 1', () => {
      expect(formatter.truncate('hello', 1)).toBe('h')
    })

    it('should handle maxWidth of 0', () => {
      expect(formatter.truncate('hello', 0)).toBe('')
    })

    it('should handle empty string', () => {
      expect(formatter.truncate('', 5)).toBe('')
    })
  })

  describe('measureWidths', () => {
    const defaultConfigs: ColumnConfig[] = [
      { header: 'Name', maxWidth: 50, minWidth: 5 },
      { header: 'Age', maxWidth: 50, minWidth: 5 },
    ]

    it('should use header width when no rows, clamped to minWidth', () => {
      const result = formatter.measureWidths(['Name', 'Age'], [], defaultConfigs)
      expect(result).toEqual([5, 5])
    })

    it('should use content width when wider than header', () => {
      const result = formatter.measureWidths(
        ['Name', 'Age'],
        [['Alexander', '30']],
        defaultConfigs,
      )
      expect(result).toEqual([9, 5])
    })

    it('should respect explicit width config', () => {
      const configs: ColumnConfig[] = [
        { header: 'Name', width: 20, maxWidth: 50, minWidth: 5 },
        { header: 'Age', width: 10, maxWidth: 50, minWidth: 5 },
      ]
      const result = formatter.measureWidths(['Name', 'Age'], [], configs)
      expect(result).toEqual([20, 10])
    })

    it('should clamp to maxWidth', () => {
      const configs: ColumnConfig[] = [
        { header: 'Name', maxWidth: 8, minWidth: 5 },
      ]
      const result = formatter.measureWidths(
        ['Name'],
        [['VeryLongNameHere']],
        configs,
      )
      expect(result).toEqual([8])
    })

    it('should enforce minWidth', () => {
      const configs: ColumnConfig[] = [
        { header: 'X', maxWidth: 50, minWidth: 10 },
      ]
      const result = formatter.measureWidths(['X'], [], configs)
      expect(result).toEqual([10])
    })

    it('should clamp explicit width to min/max bounds', () => {
      const configs: ColumnConfig[] = [
        { header: 'X', width: 2, maxWidth: 50, minWidth: 5 },
      ]
      const result = formatter.measureWidths(['X'], [], configs)
      expect(result).toEqual([5])
    })

    it('should clamp explicit width exceeding maxWidth', () => {
      const configs: ColumnConfig[] = [
        { header: 'X', width: 100, maxWidth: 20, minWidth: 5 },
      ]
      const result = formatter.measureWidths(['X'], [], configs)
      expect(result).toEqual([20])
    })

    it('should handle missing column config', () => {
      const result = formatter.measureWidths(['Name'], [], [])
      expect(result).toEqual([4])
    })
  })
})

describe('CliTable', () => {
  describe('constructor', () => {
    it('should create table with defaults', () => {
      const table = new CliTable()
      expect(table.getRowCount()).toBe(0)
      expect(table.getColumnCount()).toBe(0)
    })

    it('should accept columns and config', () => {
      const table = new CliTable(basicColumns, { borderStyle: 'double' })
      expect(table.getColumnCount()).toBe(3)
    })
  })

  describe('setColumns', () => {
    it('should set columns', () => {
      const table = new CliTable()
      table.setColumns(basicColumns)
      expect(table.getColumnCount()).toBe(3)
    })
  })

  describe('addRow', () => {
    it('should add a single row', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['Alice', '30', 'NYC'])
      expect(table.getRowCount()).toBe(1)
    })

    it('should add multiple rows sequentially', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['Alice', '30', 'NYC'])
      table.addRow(['Bob', '25', 'LA'])
      expect(table.getRowCount()).toBe(2)
    })
  })

  describe('addRows', () => {
    it('should add multiple rows at once', () => {
      const table = new CliTable(basicColumns)
      table.addRows([
        ['Alice', '30', 'NYC'],
        ['Bob', '25', 'LA'],
        ['Charlie', '35', 'Chicago'],
      ])
      expect(table.getRowCount()).toBe(3)
    })
  })

  describe('setConfig', () => {
    it('should update config partially', () => {
      const table = new CliTable(basicColumns)
      table.setConfig({ borderStyle: 'double' })
      const result = table.render()
      expect(result).toContain('╔')
      expect(result).toContain('╚')
    })
  })

  describe('render', () => {
    it('should render a simple table with single borders', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['Alice', '30', 'NYC'])
      const result = table.render()
      expect(result).toContain('┌')
      expect(result).toContain('┐')
      expect(result).toContain('└')
      expect(result).toContain('┘')
      expect(result).toContain('Name')
      expect(result).toContain('Alice')
      expect(result).toContain('30')
      expect(result).toContain('NYC')
    })

    it('should render with no border', () => {
      const table = new CliTable(basicColumns, { borderStyle: 'none' })
      table.addRow(['Alice', '30', 'NYC'])
      const result = table.render()
      expect(result).not.toContain('┌')
      expect(result).not.toContain('│')
      expect(result).toContain('Name')
      expect(result).toContain('Alice')
    })

    it('should render with double border', () => {
      const table = new CliTable(basicColumns, { borderStyle: 'double' })
      table.addRow(['Alice', '30', 'NYC'])
      const result = table.render()
      expect(result).toContain('╔')
      expect(result).toContain('╚')
      expect(result).toContain('═')
    })

    it('should render with rounded border', () => {
      const table = new CliTable(basicColumns, { borderStyle: 'rounded' })
      table.addRow(['Alice', '30', 'NYC'])
      const result = table.render()
      expect(result).toContain('╭')
      expect(result).toContain('╰')
    })

    it('should render with header off', () => {
      const table = new CliTable(basicColumns, { showHeader: false })
      table.addRow(['Alice', '30', 'NYC'])
      const result = table.render()
      expect(result).not.toContain('Name')
      expect(result).toContain('Alice')
    })

    it('should render with row separator', () => {
      const table = new CliTable(basicColumns, { showRowSeparator: true })
      table.addRow(['Alice', '30', 'NYC'])
      table.addRow(['Bob', '25', 'LA'])
      const result = table.render()
      const lines = result.split('\n')
      const dataLineCount = lines.filter((l) => l.includes('Alice') || l.includes('Bob')).length
      expect(dataLineCount).toBe(2)
      const hasMidSeparator = lines.some((l) => l.includes('├') && l.includes('┤') && l.includes('┼'))
      expect(hasMidSeparator).toBe(true)
    })

    it('should render with custom padding', () => {
      const table = new CliTable(
        [{ header: 'A', maxWidth: 50, minWidth: 2 }],
        { padding: 3 },
      )
      table.addRow(['x'])
      const result = table.render()
      expect(result).toContain('   x   ')
    })

    it('should truncate wide content when truncate is true', () => {
      const table = new CliTable(
        [{ header: 'Name', maxWidth: 10, minWidth: 5 }],
        { truncate: true },
      )
      table.addRow(['This is a very long name that exceeds maxWidth'])
      const result = table.render()
      expect(result).toContain('...')
    })

    it('should not truncate when truncate is false', () => {
      const table = new CliTable(
        [{ header: 'Name', maxWidth: 10, minWidth: 5 }],
        { truncate: false },
      )
      table.addRow(['This is a very long name'])
      const result = table.render()
      expect(result).toContain('This is a very long name')
    })
  })

  describe('getRowCount', () => {
    it('should return 0 for empty table', () => {
      const table = new CliTable(basicColumns)
      expect(table.getRowCount()).toBe(0)
    })

    it('should return correct count after adding rows', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['a', 'b', 'c'])
      table.addRow(['d', 'e', 'f'])
      expect(table.getRowCount()).toBe(2)
    })
  })

  describe('getColumnCount', () => {
    it('should return 0 for table without columns', () => {
      const table = new CliTable()
      expect(table.getColumnCount()).toBe(0)
    })

    it('should return correct column count', () => {
      const table = new CliTable(basicColumns)
      expect(table.getColumnCount()).toBe(3)
    })
  })

  describe('clear', () => {
    it('should remove all rows', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['a', 'b', 'c'])
      table.addRow(['d', 'e', 'f'])
      table.clear()
      expect(table.getRowCount()).toBe(0)
    })

    it('should preserve columns after clear', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['a', 'b', 'c'])
      table.clear()
      expect(table.getColumnCount()).toBe(3)
    })
  })

  describe('toString', () => {
    it('should return same as render', () => {
      const table = new CliTable(basicColumns)
      table.addRow(['Alice', '30', 'NYC'])
      expect(table.toString()).toBe(table.render())
    })
  })
})

describe('Edge cases', () => {
  it('should render empty table', () => {
    const table = new CliTable()
    expect(table.render()).toBe('')
  })

  it('should render empty table with columns but no rows', () => {
    const table = new CliTable([{ header: 'A', maxWidth: 50, minWidth: 5 }])
    const result = table.render()
    expect(result).toContain('A')
  })

  it('should render single column table', () => {
    const table = new CliTable([{ header: 'Value', maxWidth: 50, minWidth: 5 }])
    table.addRow(['hello'])
    const result = table.render()
    expect(result).toContain('Value')
    expect(result).toContain('hello')
  })

  it('should render single row table', () => {
    const table = new CliTable([
      { header: 'A', maxWidth: 50, minWidth: 5 },
      { header: 'B', maxWidth: 50, minWidth: 5 },
    ])
    table.addRow(['x', 'y'])
    const result = table.render()
    expect(result).toContain('x')
    expect(result).toContain('y')
  })

  it('should truncate wide content', () => {
    const table = new CliTable([{ header: 'Data', maxWidth: 8, minWidth: 5 }])
    table.addRow(['VeryLongContentThatShouldBeTruncated'])
    const result = table.render()
    expect(result).toContain('...')
  })

  it('should handle narrow columns with minWidth', () => {
    const table = new CliTable([{ header: 'X', maxWidth: 50, minWidth: 10 }])
    table.addRow(['a'])
    const result = table.render()
    const lines = result.split('\n')
    const dataLine = lines.find((l) => l.includes('a'))
    expect(dataLine).toBeDefined()
  })

  it('should handle empty cells', () => {
    const table = new CliTable([
      { header: 'A', maxWidth: 50, minWidth: 5 },
      { header: 'B', maxWidth: 50, minWidth: 5 },
    ])
    table.addRow(['', 'hello'])
    table.addRow(['world', ''])
    const result = table.render()
    expect(result).toContain('hello')
    expect(result).toContain('world')
  })

  it('should handle row separator on single row (no separator)', () => {
    const table = new CliTable(
      [{ header: 'A', maxWidth: 50, minWidth: 5 }],
      { showRowSeparator: true },
    )
    table.addRow(['x'])
    const result = table.render()
    const lines = result.split('\n')
    const dataLineIndices = lines.reduce<number[]>((acc, l, idx) => {
      if (l.includes('x')) acc.push(idx)
      return acc
    }, [])
    let separatorBetweenData = 0
    for (let i = 0; i < dataLineIndices.length - 1; i++) {
      const between = dataLineIndices[i]! + 1
      if (between < dataLineIndices[i + 1]!) {
        separatorBetweenData++
      }
    }
    expect(separatorBetweenData).toBe(0)
  })

  it('should not add row separator after last row', () => {
    const cols: ColumnConfig[] = [
      { header: 'A', maxWidth: 50, minWidth: 5 },
      { header: 'B', maxWidth: 50, minWidth: 5 },
    ]
    const table = new CliTable(cols, { showRowSeparator: true })
    table.addRow(['1', '2'])
    table.addRow(['3', '4'])
    const lines = table.render().split('\n')
    expect(lines[lines.length - 1]).toContain('└')
    expect(lines[lines.length - 1]).toContain('┘')
  })

  it('should render without top/bottom separators when border is none', () => {
    const table = new CliTable(
      [{ header: 'A', maxWidth: 50, minWidth: 5 }],
      { borderStyle: 'none' },
    )
    table.addRow(['x'])
    const result = table.render()
    expect(result).not.toContain('┌')
    expect(result).not.toContain('└')
  })

  it('should handle multiple addRows calls', () => {
    const table = new CliTable([{ header: 'V', maxWidth: 50, minWidth: 5 }])
    table.addRows([['a'], ['b']])
    table.addRows([['c'], ['d']])
    expect(table.getRowCount()).toBe(4)
  })

  it('should render with none border style showing no box chars', () => {
    const table = new CliTable(basicColumns, { borderStyle: 'none' })
    table.addRow(['Alice', '30', 'NYC'])
    table.addRow(['Bob', '25', 'LA'])
    const result = table.render()
    expect(result).not.toContain('┌')
    expect(result).not.toContain('└')
    expect(result).not.toContain('│')
    expect(result).toContain('Alice')
    expect(result).toContain('Bob')
  })

  it('should render multi-row table correctly', () => {
    const table = new CliTable(basicColumns)
    table.addRows([
      ['Alice', '30', 'NYC'],
      ['Bob', '25', 'LA'],
      ['Charlie', '35', 'Chicago'],
    ])
    const result = table.render()
    const lines = result.split('\n')
    expect(lines.filter((l) => l.includes('Alice')).length).toBe(1)
    expect(lines.filter((l) => l.includes('Bob')).length).toBe(1)
    expect(lines.filter((l) => l.includes('Charlie')).length).toBe(1)
  })

  it('should render after clear and re-add', () => {
    const table = new CliTable(basicColumns)
    table.addRow(['Old', '1', 'X'])
    table.clear()
    table.addRow(['New', '2', 'Y'])
    const result = table.render()
    expect(result).toContain('New')
    expect(result).not.toContain('Old')
  })

  it('should respect default alignment as left', () => {
    const table = new CliTable([{ header: 'Val', maxWidth: 20, minWidth: 5 }])
    table.addRow(['test'])
    const result = table.render()
    const lines = result.split('\n')
    const dataLine = lines.find((l) => l.includes('test'))
    expect(dataLine).toBeDefined()
    expect(dataLine!.trimStart().startsWith('│ test')).toBe(true)
  })

  it('should handle rendering after setColumns', () => {
    const table = new CliTable()
    table.setColumns([{ header: 'X', maxWidth: 50, minWidth: 5 }])
    table.addRow(['hello'])
    const result = table.render()
    expect(result).toContain('hello')
    expect(result).toContain('X')
  })

  it('should handle setConfig multiple times', () => {
    const table = new CliTable(basicColumns)
    table.setConfig({ borderStyle: 'double' })
    table.setConfig({ borderStyle: 'rounded' })
    const result = table.render()
    expect(result).toContain('╭')
    expect(result).toContain('╰')
  })

  it('should produce correct line structure for single row', () => {
    const table = new CliTable([{ header: 'A', maxWidth: 50, minWidth: 5 }])
    table.addRow(['x'])
    const lines = table.render().split('\n')
    expect(lines.length).toBe(5)
    expect(lines[0]).toContain('┌')
    expect(lines[1]).toContain('A')
    expect(lines[3]).toContain('x')
    expect(lines[4]).toContain('└')
  })

  it('should handle content exactly at maxWidth', () => {
    const table = new CliTable([{ header: 'Val', maxWidth: 5, minWidth: 3 }])
    table.addRow(['12345'])
    const result = table.render()
    expect(result).toContain('12345')
    expect(result).not.toContain('...')
  })

  it('should handle showRowSeparator with three rows producing two separators', () => {
    const cols: ColumnConfig[] = [
      { header: 'A', maxWidth: 50, minWidth: 5 },
      { header: 'B', maxWidth: 50, minWidth: 5 },
    ]
    const table = new CliTable(cols, { showRowSeparator: true })
    table.addRow(['1', 'a'])
    table.addRow(['2', 'b'])
    table.addRow(['3', 'c'])
    const lines = table.render().split('\n')
    const dataLines = lines.filter((l) => l.includes('1') || l.includes('2') || l.includes('3'))
    expect(dataLines.length).toBe(3)
    const allSeparators = lines.filter((l) => l.includes('├'))
    expect(allSeparators.length).toBe(3)
  })

  it('should render double border with correct corner chars', () => {
    const table = new CliTable(
      [{ header: 'A', maxWidth: 50, minWidth: 5 }],
      { borderStyle: 'double' },
    )
    table.addRow(['x'])
    const result = table.render()
    expect(result).toContain('╔')
    expect(result).toContain('╗')
    expect(result).toContain('╚')
    expect(result).toContain('╝')
  })

  it('should handle toString after adding rows', () => {
    const table = new CliTable(basicColumns)
    table.addRow(['Alice', '30', 'NYC'])
    const str = table.toString()
    expect(str).toContain('Alice')
    expect(str.length).toBeGreaterThan(0)
  })

  it('should handle column with explicit width ignoring content', () => {
    const table = new CliTable([
      { header: 'Val', width: 8, maxWidth: 50, minWidth: 5 },
    ])
    table.addRow(['VeryLongContent'])
    const result = table.render()
    expect(result).toContain('...')
  })

  it('should render table with default config applied', () => {
    const table = new CliTable([{ header: 'X', maxWidth: 50, minWidth: 5 }])
    table.addRow(['hello'])
    const result = table.render()
    expect(result).toContain('┌')
    expect(result).toContain('└')
    expect(result).toContain('│')
    expect(result).toContain('X')
    expect(result).toContain('hello')
  })

  it('should render correctly with header off and no border', () => {
    const table = new CliTable(basicColumns, { showHeader: false, borderStyle: 'none' })
    table.addRow(['test', '1', 'here'])
    const result = table.render()
    expect(result).not.toContain('Name')
    expect(result).not.toContain('│')
    expect(result).toContain('test')
  })
})
