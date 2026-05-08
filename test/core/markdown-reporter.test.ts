import { describe, it, expect } from 'vitest'
import { TableBuilder } from '../../src/core/markdown-reporter/table-builder.js'
import { MarkdownReporter } from '../../src/core/markdown-reporter/markdown-reporter.js'
import { DEFAULT_REPORT_CONFIG } from '../../src/core/markdown-reporter/types.js'
import type { MarkdownTableConfig, ReportSection, SeverityBadge, ReportConfig } from '../../src/core/markdown-reporter/types.js'

describe('TableBuilder', () => {
  describe('setHeaders', () => {
    it('should set headers with default left alignment', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Name', 'Age', 'City'])
      builder.addRow(['Alice', '30', 'NYC'])
      const result = builder.build()
      expect(result).toContain('Name')
      expect(result).toContain('Age')
      expect(result).toContain('City')
    })

    it('should set headers with custom alignment', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Name', 'Age', 'City'], ['left', 'center', 'right'])
      builder.addRow(['Alice', '30', 'NYC'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines[1]).toContain(':---')
      expect(lines[1]).toContain(':---:')
      expect(lines[1]).toContain('---:')
    })
  })

  describe('addRow', () => {
    it('should add a single row', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B'])
      builder.addRow(['1', '2'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines.length).toBe(3)
      expect(lines[2]).toBe('| 1 | 2 |')
    })

    it('should add multiple rows individually', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A'])
      builder.addRow(['1'])
      builder.addRow(['2'])
      builder.addRow(['3'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines.length).toBe(5)
    })
  })

  describe('addRows', () => {
    it('should add multiple rows at once', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B'])
      builder.addRows([
        ['1', '2'],
        ['3', '4'],
      ])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines.length).toBe(4)
      expect(lines[2]).toBe('| 1 | 2 |')
      expect(lines[3]).toBe('| 3 | 4 |')
    })
  })

  describe('build', () => {
    it('should build a simple table', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Name', 'Value'])
      builder.addRow(['foo', 'bar'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines[0]).toBe('| Name | Value |')
      expect(lines[1]).toBe('| :--- | :--- |')
      expect(lines[2]).toBe('| foo | bar |')
    })

    it('should build table with alignment', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Left', 'Center', 'Right'], ['left', 'center', 'right'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines[1]).toBe('| :--- | :---: | ---: |')
    })

    it('should return empty string when no headers set', () => {
      const builder = new TableBuilder()
      expect(builder.build()).toBe('')
    })

    it('should return header and separator with no rows', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines.length).toBe(2)
      expect(lines[0]).toBe('| A | B |')
      expect(lines[1]).toBe('| :--- | :--- |')
    })

    it('should handle single column', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Only'])
      builder.addRow(['value'])
      const result = builder.build()
      expect(result).toBe('| Only |\n| :--- |\n| value |')
    })

    it('should handle large tables', () => {
      const builder = new TableBuilder()
      const headers = Array.from({ length: 10 }, (_, i) => 'H' + i)
      builder.setHeaders(headers)
      const rows = Array.from({ length: 50 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => 'R' + r + 'C' + c)
      )
      builder.addRows(rows)
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines.length).toBe(52)
    })

    it('should handle missing cells in a row', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A', 'B', 'C'])
      builder.addRow(['1'])
      const result = builder.build()
      const lines = result.split('\n')
      expect(lines[2]).toBe('| 1 |  |  |')
    })
  })

  describe('reset', () => {
    it('should clear all data', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['A'])
      builder.addRow(['1'])
      builder.reset()
      expect(builder.build()).toBe('')
    })

    it('should allow building after reset', () => {
      const builder = new TableBuilder()
      builder.setHeaders(['Old'])
      builder.addRow(['data'])
      builder.reset()
      builder.setHeaders(['New'])
      builder.addRow(['stuff'])
      const result = builder.build()
      expect(result).toContain('New')
      expect(result).toContain('stuff')
      expect(result).not.toContain('Old')
    })
  })

  describe('fromConfig', () => {
    it('should build a table from MarkdownTableConfig', () => {
      const config: MarkdownTableConfig = {
        headers: ['Name', 'Score'],
        rows: [
          ['Alice', '95'],
          ['Bob', '87'],
        ],
        alignment: ['left', 'right'],
      }
      const result = TableBuilder.fromConfig(config)
      expect(result).toContain('Alice')
      expect(result).toContain('95')
      expect(result).toContain('---:')
    })
  })
})

describe('MarkdownReporter', () => {
  describe('heading', () => {
    it('should create level 1 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Title', 1)).toBe('# Title')
    })

    it('should create level 2 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Section', 2)).toBe('## Section')
    })

    it('should create level 3 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Sub', 3)).toBe('### Sub')
    })

    it('should create level 4 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Deep', 4)).toBe('#### Deep')
    })

    it('should create level 5 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Deeper', 5)).toBe('##### Deeper')
    })

    it('should create level 6 heading', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Deepest', 6)).toBe('###### Deepest')
    })

    it('should clamp level below 1 to 1', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Min', 0)).toBe('# Min')
    })

    it('should clamp level above 6 to 6', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.heading('Max', 10)).toBe('###### Max')
    })
  })

  describe('paragraph', () => {
    it('should return text as-is', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.paragraph('Hello world')).toBe('Hello world')
    })

    it('should handle empty string', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.paragraph('')).toBe('')
    })
  })

  describe('codeBlock', () => {
    it('should create code block with language', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.codeBlock('const x = 1', 'typescript')
      expect(result).toBe('```typescript\nconst x = 1\n```')
    })

    it('should create code block without language', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.codeBlock('echo hello')
      expect(result).toBe('```\necho hello\n```')
    })

    it('should truncate code block when exceeding maxCodeBlockLines', () => {
      const reporter = new MarkdownReporter({ maxCodeBlockLines: 3 })
      const code = 'line1\nline2\nline3\nline4\nline5'
      const result = reporter.codeBlock(code)
      expect(result).toContain('line1')
      expect(result).toContain('line2')
      expect(result).toContain('line3')
      expect(result).toContain('2 more lines')
      expect(result).not.toContain('line4')
    })

    it('should not truncate code block within limit', () => {
      const reporter = new MarkdownReporter()
      const code = 'line1\nline2\nline3'
      const result = reporter.codeBlock(code)
      expect(result).toBe('```\nline1\nline2\nline3\n```')
    })

    it('should handle single line code', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.codeBlock('single', 'js')
      expect(result).toBe('```js\nsingle\n```')
    })
  })

  describe('bold', () => {
    it('should wrap text in double asterisks', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.bold('text')).toBe('**text**')
    })
  })

  describe('italic', () => {
    it('should wrap text in single asterisks', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.italic('text')).toBe('*text*')
    })
  })

  describe('strikethrough', () => {
    it('should wrap text in double tildes', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.strikethrough('text')).toBe('~~text~~')
    })
  })

  describe('link', () => {
    it('should create markdown link', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.link('Click', 'https://example.com')).toBe('[Click](https://example.com)')
    })
  })

  describe('image', () => {
    it('should create markdown image', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.image('alt text', 'https://img.png')).toBe('![alt text](https://img.png)')
    })
  })

  describe('list', () => {
    it('should create unordered list', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.list(['item1', 'item2', 'item3'])
      expect(result).toBe('- item1\n- item2\n- item3')
    })

    it('should create ordered list', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.list(['first', 'second', 'third'], true)
      expect(result).toBe('1. first\n2. second\n3. third')
    })

    it('should return empty string for empty list', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.list([])).toBe('')
    })

    it('should return empty string for empty ordered list', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.list([], true)).toBe('')
    })

    it('should handle single item list', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.list(['only'])).toBe('- only')
    })
  })

  describe('badge', () => {
    it('should create critical badge with icon', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.badge('Error', 'critical')
      expect(result).toBe('🟥 Error [CRITICAL]')
    })

    it('should create high badge with icon', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.badge('Warning', 'high')
      expect(result).toBe('🟧 Warning [HIGH]')
    })

    it('should create medium badge with icon', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.badge('Notice', 'medium')
      expect(result).toBe('🟨 Notice [MEDIUM]')
    })

    it('should create low badge with icon', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.badge('Info', 'low')
      expect(result).toBe('🟩 Info [LOW]')
    })

    it('should create info badge with icon', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.badge('Debug', 'info')
      expect(result).toBe('🟦 Debug [INFO]')
    })

    it('should create badge without icon when severityIcons is false', () => {
      const reporter = new MarkdownReporter({ severityIcons: false })
      const result = reporter.badge('Error', 'critical')
      expect(result).toBe('![CRITICAL]')
    })
  })

  describe('table', () => {
    it('should generate a markdown table', () => {
      const reporter = new MarkdownReporter()
      const config: MarkdownTableConfig = {
        headers: ['Name', 'Value'],
        rows: [['key', 'val']],
        alignment: ['left', 'left'],
      }
      const result = reporter.table(config)
      expect(result).toContain('| Name | Value |')
      expect(result).toContain('| key | val |')
    })

    it('should generate table with alignment', () => {
      const reporter = new MarkdownReporter()
      const config: MarkdownTableConfig = {
        headers: ['Left', 'Right'],
        rows: [['a', 'b']],
        alignment: ['left', 'right'],
      }
      const result = reporter.table(config)
      expect(result).toContain(':---')
      expect(result).toContain('---:')
    })
  })

  describe('hr', () => {
    it('should return horizontal rule', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.hr()).toBe('---')
    })
  })

  describe('blockquote', () => {
    it('should create blockquote', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.blockquote('quoted text')).toBe('> quoted text')
    })
  })

  describe('generateReport', () => {
    it('should generate report with TOC', () => {
      const reporter = new MarkdownReporter({ includeTOC: true, includeTimestamp: false })
      const sections: ReportSection[] = [
        { title: 'Section A', content: 'Content A', subsections: [] },
      ]
      const result = reporter.generateReport(sections)
      expect(result).toContain('Table of Contents')
      expect(result).toContain('Section A')
      expect(result).toContain('Content A')
    })

    it('should generate report with timestamp', () => {
      const reporter = new MarkdownReporter({ includeTOC: false, includeTimestamp: true })
      const sections: ReportSection[] = []
      const result = reporter.generateReport(sections)
      expect(result).toContain('Generated:')
    })

    it('should generate report without timestamp when disabled', () => {
      const reporter = new MarkdownReporter({ includeTOC: false, includeTimestamp: false })
      const result = reporter.generateReport([])
      expect(result).not.toContain('Generated:')
    })

    it('should handle nested sections', () => {
      const reporter = new MarkdownReporter({ includeTOC: true, includeTimestamp: false })
      const sections: ReportSection[] = [
        {
          title: 'Parent',
          content: 'Parent content',
          subsections: [
            { title: 'Child', content: 'Child content', subsections: [] },
          ],
        },
      ]
      const result = reporter.generateReport(sections)
      expect(result).toContain('Parent')
      expect(result).toContain('Child')
      expect(result).toContain('Parent content')
      expect(result).toContain('Child content')
    })

    it('should handle empty sections', () => {
      const reporter = new MarkdownReporter({ includeTOC: false, includeTimestamp: false })
      const result = reporter.generateReport([])
      expect(result).toContain('# Report')
    })

    it('should include TOC entries for nested subsections', () => {
      const reporter = new MarkdownReporter({ includeTOC: true, includeTimestamp: false })
      const sections: ReportSection[] = [
        {
          title: 'Main',
          content: '',
          subsections: [
            { title: 'Sub One', content: '', subsections: [] },
            { title: 'Sub Two', content: '', subsections: [] },
          ],
        },
      ]
      const result = reporter.generateReport(sections)
      expect(result).toContain('Sub One')
      expect(result).toContain('Sub Two')
    })
  })

  describe('getConfig', () => {
    it('should return default config when no config provided', () => {
      const reporter = new MarkdownReporter()
      const config = reporter.getConfig()
      expect(config.includeTOC).toBe(true)
      expect(config.includeTimestamp).toBe(true)
      expect(config.maxCodeBlockLines).toBe(10)
      expect(config.severityIcons).toBe(true)
    })

    it('should return merged config', () => {
      const reporter = new MarkdownReporter({ maxCodeBlockLines: 5, severityIcons: false })
      const config = reporter.getConfig()
      expect(config.maxCodeBlockLines).toBe(5)
      expect(config.severityIcons).toBe(false)
      expect(config.includeTOC).toBe(true)
    })

    it('should return a copy of the config', () => {
      const reporter = new MarkdownReporter()
      const config = reporter.getConfig()
      config.maxCodeBlockLines = 99
      expect(reporter.getConfig().maxCodeBlockLines).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in heading', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.heading('Hello <World> & "Friends"', 1)
      expect(result).toBe('# Hello <World> & "Friends"')
    })

    it('should handle special characters in bold', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.bold('a * b')).toBe('**a * b**')
    })

    it('should handle special characters in link', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.link('Go', 'https://example.com?a=1&b=2')
      expect(result).toBe('[Go](https://example.com?a=1&b=2)')
    })

    it('should handle code block with empty string', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.codeBlock('')
      expect(result).toBe('```\n\n```')
    })

    it('should handle list with special characters', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.list(['<script>', 'a & b'])
      expect(result).toContain('- <script>')
      expect(result).toContain('- a & b')
    })
  })
})

describe('DEFAULT_REPORT_CONFIG', () => {
  it('should have includeTOC default to true', () => {
    expect(DEFAULT_REPORT_CONFIG.includeTOC).toBe(true)
  })

  it('should have includeTimestamp default to true', () => {
    expect(DEFAULT_REPORT_CONFIG.includeTimestamp).toBe(true)
  })

  it('should have maxCodeBlockLines default to 10', () => {
    expect(DEFAULT_REPORT_CONFIG.maxCodeBlockLines).toBe(10)
  })

  it('should have severityIcons default to true', () => {
    expect(DEFAULT_REPORT_CONFIG.severityIcons).toBe(true)
  })
})

describe('TableBuilder additional', () => {
  it('should build empty table with only headers', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['Col1', 'Col2', 'Col3'])
    const result = builder.build()
    const lines = result.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[0]).toBe('| Col1 | Col2 | Col3 |')
    expect(lines[1]).toBe('| :--- | :--- | :--- |')
  })

  it('should handle mixed alignment per column', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['L', 'C', 'R'], ['left', 'center', 'right'])
    builder.addRow(['a', 'b', 'c'])
    const result = builder.build()
    const lines = result.split('\n')
    expect(lines[1]).toBe('| :--- | :---: | ---: |')
    expect(lines[2]).toBe('| a | b | c |')
  })

  it('should build table after multiple addRow calls', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['ID'])
    for (let i = 0; i < 5; i++) {
      builder.addRow([String(i)])
    }
    const result = builder.build()
    const lines = result.split('\n')
    expect(lines.length).toBe(7)
    expect(lines[2]).toBe('| 0 |')
    expect(lines[6]).toBe('| 4 |')
  })

  it('should handle empty string cells', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['A', 'B'])
    builder.addRow(['', ''])
    const result = builder.build()
    const lines = result.split('\n')
    expect(lines[2]).toBe('|  |  |')
  })

  it('should handle cells with pipe characters', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['Text'])
    builder.addRow(['a|b'])
    const result = builder.build()
    expect(result).toContain('a|b')
  })

  it('should handle Unicode content in cells', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['Emoji'])
    builder.addRow(['🎉'])
    const result = builder.build()
    expect(result).toContain('🎉')
  })

  it('should produce correct structure with addRows then addRow', () => {
    const builder = new TableBuilder()
    builder.setHeaders(['X'])
    builder.addRows([['1'], ['2']])
    builder.addRow(['3'])
    const result = builder.build()
    const lines = result.split('\n')
    expect(lines.length).toBe(5)
    expect(lines[2]).toBe('| 1 |')
    expect(lines[3]).toBe('| 2 |')
    expect(lines[4]).toBe('| 3 |')
  })
})

describe('MarkdownReporter additional', () => {
  it('should handle heading with negative level', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.heading('Test', -1)).toBe('# Test')
  })

  it('should handle codeBlock truncation with language specified', () => {
    const reporter = new MarkdownReporter({ maxCodeBlockLines: 2 })
    const code = 'line1\nline2\nline3\nline4'
    const result = reporter.codeBlock(code, 'python')
    expect(result).toContain('```python')
    expect(result).toContain('2 more lines')
  })

  it('should handle generateReport with TOC disabled', () => {
    const reporter = new MarkdownReporter({ includeTOC: false, includeTimestamp: false })
    const sections: ReportSection[] = [
      { title: 'Section 1', content: 'Body text', subsections: [] },
    ]
    const result = reporter.generateReport(sections)
    expect(result).not.toContain('Table of Contents')
    expect(result).toContain('Section 1')
  })

  it('should handle blockquote with empty text', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.blockquote('')).toBe('> ')
  })

  it('should handle image with empty alt', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.image('', 'https://img.png')).toBe('![](https://img.png)')
  })

  it('should handle link with empty text', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.link('', 'https://example.com')).toBe('[](https://example.com)')
  })

  it('should handle strikethrough with empty text', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.strikethrough('')).toBe('~~~~')
  })

  it('should handle bold with empty text', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.bold('')).toBe('****')
  })

  it('should handle italic with empty text', () => {
    const reporter = new MarkdownReporter()
    expect(reporter.italic('')).toBe('**')
  })

  it('should generate report with deeply nested subsections', () => {
    const reporter = new MarkdownReporter({ includeTOC: true, includeTimestamp: false })
    const sections: ReportSection[] = [
      {
        title: 'Level 1',
        content: 'L1',
        subsections: [
          {
            title: 'Level 2',
            content: 'L2',
            subsections: [
              { title: 'Level 3', content: 'L3', subsections: [] },
            ],
          },
        ],
      },
    ]
    const result = reporter.generateReport(sections)
    expect(result).toContain('Level 1')
    expect(result).toContain('Level 2')
    expect(result).toContain('Level 3')
    expect(result).toContain('#### Level 3')
  })
})
