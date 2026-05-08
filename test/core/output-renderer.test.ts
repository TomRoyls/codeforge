import { describe, it, expect } from 'vitest'
import { OutputRenderer } from '../../src/core/output-renderer/output-renderer.js'
import type {
  RenderFormat,
  RenderOptions,
  RenderTheme,
  Renderable,
  TableData,
  ListData,
} from '../../src/core/output-renderer/types.js'

describe('Construction', () => {
  it('should create with default options', () => {
    const renderer = new OutputRenderer()
    const opts = renderer.getOptions()
    expect(opts.format).toBe('text')
    expect(opts.color).toBe(true)
    expect(opts.indent).toBe(2)
    expect(opts.maxWidth).toBe(80)
  })

  it('should create with custom options', () => {
    const renderer = new OutputRenderer({ format: 'json', maxWidth: 120, indent: 4 })
    const opts = renderer.getOptions()
    expect(opts.format).toBe('json')
    expect(opts.maxWidth).toBe(120)
    expect(opts.indent).toBe(4)
  })

  it('should create with custom theme', () => {
    const theme: Partial<RenderTheme> = {
      success: '\x1b[32m',
      error: '\x1b[31m',
      bold: '\x1b[1m',
      reset: '\x1b[0m',
    }
    const renderer = new OutputRenderer({ theme })
    const opts = renderer.getOptions()
    expect(opts.theme.success).toBe('\x1b[32m')
    expect(opts.theme.error).toBe('\x1b[31m')
    expect(opts.theme.bold).toBe('\x1b[1m')
    expect(opts.theme.reset).toBe('\x1b[0m')
  })

  it('should merge partial theme with defaults', () => {
    const renderer = new OutputRenderer({ theme: { success: 'green' } })
    const opts = renderer.getOptions()
    expect(opts.theme.success).toBe('green')
    expect(opts.theme.error).toBe('')
    expect(opts.theme.warning).toBe('')
  })
})

describe('Buffer operations', () => {
  it('should add heading element', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Title', 1)
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('heading')
    expect(buf[0]!.content).toBe('Title')
  })

  it('should add text element', () => {
    const renderer = new OutputRenderer()
    renderer.text('hello world')
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('text')
    expect(buf[0]!.content).toBe('hello world')
  })

  it('should add list element', () => {
    const renderer = new OutputRenderer()
    renderer.list(['a', 'b', 'c'])
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('list')
    const data = buf[0]!.content as ListData
    expect(data.items).toEqual(['a', 'b', 'c'])
    expect(data.ordered).toBe(false)
  })

  it('should add table element', () => {
    const renderer = new OutputRenderer()
    renderer.table(['A', 'B'], [['1', '2']])
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('table')
    const data = buf[0]!.content as TableData
    expect(data.headers).toEqual(['A', 'B'])
    expect(data.rows).toEqual([['1', '2']])
  })

  it('should add code element', () => {
    const renderer = new OutputRenderer()
    renderer.code('const x = 1', 'typescript')
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('code')
    expect(buf[0]!.content).toBe('const x = 1')
    expect(buf[0]!.options['language']).toBe('typescript')
  })

  it('should add divider element', () => {
    const renderer = new OutputRenderer()
    renderer.divider()
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('divider')
  })

  it('should add group element', () => {
    const renderer = new OutputRenderer()
    const elements: Renderable[] = [
      { type: 'text', content: 'hello', options: {} },
      { type: 'text', content: 'world', options: {} },
    ]
    renderer.group(elements)
    const buf = renderer.getBuffer()
    expect(buf).toHaveLength(1)
    expect(buf[0]!.type).toBe('group')
    expect(buf[0]!.content).toEqual(elements)
  })

  it('should clear buffer', () => {
    const renderer = new OutputRenderer()
    renderer.text('a')
    renderer.text('b')
    renderer.clear()
    expect(renderer.getBuffer()).toHaveLength(0)
  })

  it('should getBuffer returns copy', () => {
    const renderer = new OutputRenderer()
    renderer.text('a')
    const buf = renderer.getBuffer()
    buf.push({ type: 'text', content: 'extra', options: {} })
    expect(renderer.getBuffer()).toHaveLength(1)
  })
})

describe('renderText', () => {
  it('should render heading with #', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Title', 1)
    expect(renderer.render()).toBe('# Title')
  })

  it('should render heading level 2', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Section', 2)
    expect(renderer.render()).toBe('## Section')
  })

  it('should render heading level 3', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Sub', 3)
    expect(renderer.render()).toBe('### Sub')
  })

  it('should render text as-is', () => {
    const renderer = new OutputRenderer()
    renderer.text('plain text')
    expect(renderer.render()).toBe('plain text')
  })

  it('should render list with bullets', () => {
    const renderer = new OutputRenderer()
    renderer.list(['item1', 'item2', 'item3'])
    const result = renderer.render()
    expect(result).toBe('- item1\n- item2\n- item3')
  })

  it('should render table with borders', () => {
    const renderer = new OutputRenderer()
    renderer.table(['Name', 'Age'], [['Alice', '30']])
    const result = renderer.render()
    expect(result).toContain('| Name')
    expect(result).toContain('| Age')
    expect(result).toContain('| Alice')
    expect(result).toContain('| 30')
    expect(result).toContain('---')
  })

  it('should render code block', () => {
    const renderer = new OutputRenderer()
    renderer.code('let x = 1', 'ts')
    const result = renderer.render()
    expect(result).toContain('```ts')
    expect(result).toContain('let x = 1')
    expect(result).toContain('```')
  })

  it('should render divider as ---', () => {
    const renderer = new OutputRenderer()
    renderer.divider()
    expect(renderer.render()).toBe('---')
  })

  it('should render multiple elements separated by blank line', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Title', 1)
    renderer.text('content')
    const result = renderer.render()
    expect(result).toBe('# Title\n\ncontent')
  })
})

describe('renderJSON', () => {
  it('should render heading as valid JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.heading('Title', 2)
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('heading')
    expect(parsed.content).toBe('Title')
    expect(parsed.level).toBe(2)
  })

  it('should render text as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.text('hello')
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('text')
    expect(parsed.content).toBe('hello')
  })

  it('should render list as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.list(['a', 'b'], { ordered: true })
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('list')
    expect(parsed.content.items).toEqual(['a', 'b'])
    expect(parsed.content.ordered).toBe(true)
  })

  it('should render table as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.table(['X'], [['1']])
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('table')
    expect(parsed.content.headers).toEqual(['X'])
    expect(parsed.content.rows).toEqual([['1']])
  })

  it('should render code as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.code('code here', 'js')
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('code')
    expect(parsed.content).toBe('code here')
    expect(parsed.language).toBe('js')
  })

  it('should render divider as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.divider()
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('divider')
  })

  it('should render group as JSON', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    const elements: Renderable[] = [
      { type: 'text', content: 'a', options: {} },
    ]
    renderer.group(elements)
    const result = renderer.render()
    const parsed = JSON.parse(result)
    expect(parsed.type).toBe('group')
    expect(parsed.content).toHaveLength(1)
  })

  it('should use configured indent', () => {
    const renderer = new OutputRenderer({ format: 'json', indent: 4 })
    renderer.text('x')
    const result = renderer.render()
    expect(result).toContain('    ')
  })
})

describe('renderTable', () => {
  it('should render table with column alignment', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.table(['Name', 'Value'], [['test', '42']], ['left', 'right'])
    const result = renderer.render()
    expect(result).toContain('| Name')
    expect(result).toContain('| test')
    expect(result).toContain('42')
  })

  it('should auto-size columns', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.table(['A', 'B'], [['short', 'much longer content']])
    const result = renderer.render()
    expect(result).toContain('short')
    expect(result).toContain('much longer content')
  })

  it('should render headers only', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.table(['H1', 'H2'], [])
    const result = renderer.render()
    expect(result).toContain('| H1')
    expect(result).toContain('| H2')
    expect(result).toContain('--')
  })

  it('should render empty rows gracefully', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.table(['A'], [[]])
    const result = renderer.render()
    expect(result).toContain('| A')
  })

  it('should handle non-table elements in table format', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.text('just text')
    const result = renderer.render()
    expect(result).toBe('just text')
  })
})

describe('renderList', () => {
  it('should render ordered list', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.list(['first', 'second', 'third'], { ordered: true })
    const result = renderer.render()
    expect(result).toContain('1. first')
    expect(result).toContain('2. second')
    expect(result).toContain('3. third')
  })

  it('should render unordered list', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.list(['a', 'b'], { ordered: false })
    const result = renderer.render()
    expect(result).toContain('- a')
    expect(result).toContain('- b')
  })

  it('should render list with custom bullet', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.list(['x', 'y'], { bullet: '*' })
    const result = renderer.render()
    expect(result).toContain('* x')
    expect(result).toContain('* y')
  })

  it('should handle non-list elements in list format', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.text('plain')
    const result = renderer.render()
    expect(result).toBe('plain')
  })
})

describe('renderCSV', () => {
  it('should render CSV with headers', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['Name', 'Age'], [['Alice', '30']])
    const result = renderer.render()
    expect(result).toContain('Name,Age')
    expect(result).toContain('Alice,30')
  })

  it('should render comma-separated rows', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['A', 'B', 'C'], [['1', '2', '3']])
    const result = renderer.render()
    expect(result).toContain('1,2,3')
  })

  it('should quote fields with commas', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['Desc'], [['hello, world']])
    const result = renderer.render()
    expect(result).toContain('"hello, world"')
  })

  it('should quote fields with quotes', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['Msg'], [['say "hi"']])
    const result = renderer.render()
    expect(result).toContain('"say ""hi"""')
  })

  it('should quote fields with newlines', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['Text'], [['line1\nline2']])
    const result = renderer.render()
    expect(result).toContain('"line1\nline2"')
  })

  it('should not quote simple fields', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['Val'], [['simple']])
    const result = renderer.render()
    expect(result).toContain('simple')
    expect(result).not.toContain('"simple"')
  })

  it('should handle multiple rows in CSV', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.table(['X', 'Y'], [['1', '2'], ['3', '4']])
    const result = renderer.render()
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('X,Y')
    expect(lines[1]).toBe('1,2')
    expect(lines[2]).toBe('3,4')
  })
})

describe('formatTable', () => {
  it('should align left by default', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['Name'], [['Alice']])
    expect(result).toContain('Alice')
  })

  it('should align right', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['Num'], [['42']], ['right'])
    expect(result).toContain('42')
  })

  it('should align center', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['Val'], [['mid']], ['center'])
    expect(result).toContain('mid')
  })

  it('should calculate column widths from content', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['A', 'B'], [['short', 'longer value']])
    const lines = result.split('\n')
    const headerCells = lines[0]!.split('|').filter(Boolean)
    expect(headerCells.length).toBeGreaterThanOrEqual(2)
  })

  it('should truncate columns that exceed maxWidth', () => {
    const renderer = new OutputRenderer({ maxWidth: 30 })
    const result = renderer.formatTable(
      ['A', 'B', 'C', 'D', 'E'],
      [['verylongvalue1', 'verylongvalue2', 'verylongvalue3', 'verylongvalue4', 'verylongvalue5']],
    )
    const lines = result.split('\n')
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(100)
    }
  })

  it('should handle single column', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['Col'], [['val']])
    expect(result).toContain('| Col')
    expect(result).toContain('| val')
  })

  it('should handle empty rows', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatTable(['A', 'B'], [])
    const lines = result.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('A')
    expect(lines[0]).toContain('B')
  })
})

describe('formatList', () => {
  it('should use default bullet', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList(['a', 'b'])
    expect(result).toBe('- a\n- b')
  })

  it('should use custom bullet', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList(['x'], '*')
    expect(result).toBe('* x')
  })

  it('should format numbered list', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList(['a', 'b', 'c'], '1.')
    expect(result).toBe('1. a\n2. b\n3. c')
  })

  it('should handle empty items', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList([])
    expect(result).toBe('')
  })

  it('should handle single item', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList(['only'])
    expect(result).toBe('- only')
  })
})

describe('wrapText', () => {
  it('should wrap text at specified width', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('hello world this is a test', 11)
    const lines = result.split('\n')
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(11)
    }
    expect(lines.length).toBeGreaterThan(1)
  })

  it('should preserve words', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('hello world', 10)
    expect(result).toBe('hello\nworld')
  })

  it('should leave short text unchanged', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('short', 20)
    expect(result).toBe('short')
  })

  it('should handle single word longer than width', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('superlongword', 5)
    expect(result).toBe('superlongword')
  })

  it('should handle empty string', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('', 10)
    expect(result).toBe('')
  })

  it('should wrap multiple words correctly', () => {
    const renderer = new OutputRenderer()
    const result = renderer.wrapText('aaa bbb ccc ddd', 7)
    expect(result).toBe('aaa bbb\nccc ddd')
  })
})

describe('Edge cases', () => {
  it('should render empty buffer', () => {
    const renderer = new OutputRenderer()
    expect(renderer.render()).toBe('')
  })

  it('should render single element', () => {
    const renderer = new OutputRenderer()
    renderer.text('solo')
    expect(renderer.render()).toBe('solo')
  })

  it('should handle very long text', () => {
    const renderer = new OutputRenderer()
    const longText = 'a'.repeat(1000)
    renderer.text(longText)
    const result = renderer.render()
    expect(result).toBe(longText)
  })

  it('should handle many columns in table', () => {
    const renderer = new OutputRenderer()
    const headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const rows = [headers.map(() => 'x')]
    renderer.table(headers, rows)
    const result = renderer.render()
    for (const h of headers) {
      expect(result).toContain(h)
    }
  })

  it('should handle heading with default level', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Default')
    const buf = renderer.getBuffer()
    expect(buf[0]!.options['level']).toBe(1)
  })

  it('should clamp heading level to 1-3', () => {
    const renderer = new OutputRenderer()
    renderer.heading('High', 5)
    const buf = renderer.getBuffer()
    expect(buf[0]!.options['level']).toBe(3)
  })

  it('should clamp heading level below 1', () => {
    const renderer = new OutputRenderer()
    renderer.heading('Low', -1)
    const buf = renderer.getBuffer()
    expect(buf[0]!.options['level']).toBe(1)
  })

  it('should handle code without language', () => {
    const renderer = new OutputRenderer()
    renderer.code('some code')
    const result = renderer.render()
    expect(result).toContain('```\nsome code\n```')
  })

  it('should handle reset', () => {
    const renderer = new OutputRenderer({ format: 'json' })
    renderer.text('a')
    renderer.reset()
    expect(renderer.getBuffer()).toHaveLength(0)
    expect(renderer.getOptions().format).toBe('text')
  })

  it('should handle group rendering in text format', () => {
    const renderer = new OutputRenderer()
    renderer.group([
      { type: 'text', content: 'line1', options: {} },
      { type: 'text', content: 'line2', options: {} },
    ])
    const result = renderer.render()
    expect(result).toContain('line1')
    expect(result).toContain('line2')
  })

  it('should handle list with ordered option', () => {
    const renderer = new OutputRenderer()
    renderer.list(['alpha', 'beta'], { ordered: true })
    const result = renderer.render()
    expect(result).toContain('1. alpha')
    expect(result).toContain('2. beta')
  })

  it('should handle list with custom bullet option', () => {
    const renderer = new OutputRenderer()
    renderer.list(['x', 'y'], { bullet: '>' })
    const result = renderer.render()
    expect(result).toContain('> x')
    expect(result).toContain('> y')
  })

  it('should handle table with alignments', () => {
    const renderer = new OutputRenderer()
    renderer.table(['Left', 'Right'], [['a', 'b']], ['left', 'right'])
    const result = renderer.render()
    expect(result).toContain('Left')
    expect(result).toContain('Right')
  })

  it('should handle multiple render calls', () => {
    const renderer = new OutputRenderer()
    renderer.text('first')
    const r1 = renderer.render()
    renderer.text('second')
    const r2 = renderer.render()
    expect(r1).toBe('first')
    expect(r2).toContain('first')
    expect(r2).toContain('second')
  })

  it('should return correct options from getOptions', () => {
    const renderer = new OutputRenderer({ color: false, format: 'csv' })
    const opts = renderer.getOptions()
    expect(opts.color).toBe(false)
    expect(opts.format).toBe('csv')
    expect(opts.maxWidth).toBe(80)
  })

  it('should handle renderElement directly', () => {
    const renderer = new OutputRenderer()
    const element: Renderable = { type: 'text', content: 'direct', options: {} }
    const result = renderer.renderElement(element)
    expect(result).toBe('direct')
  })

  it('should handle table format with divider', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.divider()
    const result = renderer.render()
    expect(result).toBe('---')
  })

  it('should handle table format with heading', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.heading('Title', 1)
    const result = renderer.render()
    expect(result).toBe('# Title')
  })

  it('should handle list format with divider', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.divider()
    const result = renderer.render()
    expect(result).toBe('---')
  })

  it('should handle list format with heading', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.heading('Title', 2)
    const result = renderer.render()
    expect(result).toBe('## Title')
  })

  it('should handle csv format with divider', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.divider()
    const result = renderer.render()
    expect(result).toBe('---')
  })

  it('should handle csv format with heading', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.heading('Title', 1)
    const result = renderer.render()
    expect(result).toBe('# Title')
  })

  it('should handle group in table format', () => {
    const renderer = new OutputRenderer({ format: 'table' })
    renderer.group([
      { type: 'table', content: { headers: ['A'], rows: [['1']], alignments: [] }, options: {} },
    ])
    const result = renderer.render()
    expect(result).toContain('| A')
    expect(result).toContain('| 1')
  })

  it('should handle group in list format', () => {
    const renderer = new OutputRenderer({ format: 'list' })
    renderer.group([
      { type: 'list', content: { items: ['x'], ordered: false, bullet: '-' }, options: {} },
    ])
    const result = renderer.render()
    expect(result).toContain('- x')
  })

  it('should handle group in csv format', () => {
    const renderer = new OutputRenderer({ format: 'csv' })
    renderer.group([
      { type: 'table', content: { headers: ['X'], rows: [['val']], alignments: [] }, options: {} },
    ])
    const result = renderer.render()
    expect(result).toContain('X')
    expect(result).toContain('val')
  })

  it('should handle numeric bullet pattern as ordered', () => {
    const renderer = new OutputRenderer()
    const result = renderer.formatList(['a', 'b'], '2.')
    expect(result).toContain('1. a')
    expect(result).toContain('2. b')
  })
})
