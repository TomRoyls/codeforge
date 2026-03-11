import { describe, test, expect } from 'vitest'
import { escapeXml, escapeHtml, escapeMarkdown } from '../../../src/utils/escape'

describe('escapeXml', () => {
  test('escapes & to &amp;', () => {
    expect(escapeXml('&')).toBe('&amp;')
  })

  test('escapes < to &lt;', () => {
    expect(escapeXml('<')).toBe('&lt;')
  })

  test('escapes > to &gt;', () => {
    expect(escapeXml('>')).toBe('&gt;')
  })

  test('escapes " to &quot;', () => {
    expect(escapeXml('"')).toBe('&quot;')
  })

  test("escapes ' to &apos;", () => {
    expect(escapeXml("'")).toBe('&apos;')
  })

  test('handles strings with multiple special characters', () => {
    expect(escapeXml('<div>&"\'</div>')).toBe('&lt;div&gt;&amp;&quot;&apos;&lt;/div&gt;')
  })

  test('handles strings with no special characters (returns as-is)', () => {
    expect(escapeXml('Hello World 123')).toBe('Hello World 123')
  })

  test('handles empty string', () => {
    expect(escapeXml('')).toBe('')
  })

  test('handles strings that look like already-escaped entities', () => {
    expect(escapeXml('&amp;')).toBe('&amp;amp;')
    expect(escapeXml('&lt;')).toBe('&amp;lt;')
    expect(escapeXml('&gt;')).toBe('&amp;gt;')
  })
})

describe('escapeHtml', () => {
  test('escapes all 5 HTML special chars', () => {
    expect(escapeHtml('"')).toBe('&quot;')
    expect(escapeHtml('&')).toBe('&amp;')
    expect(escapeHtml("'")).toBe('&#039;')
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeHtml('>')).toBe('&gt;')
  })

  test('uses correct entity for single quote (&#039;)', () => {
    expect(escapeHtml("'")).toBe('&#039;')
    expect(escapeHtml("O'Reilly")).toBe('O&#039;Reilly')
  })

  test('handles multiple special characters in one string', () => {
    expect(escapeHtml('<div class="test">&\'</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;&amp;&#039;&lt;/div&gt;',
    )
  })

  test('handles strings with no special characters', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
  })

  test('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})

describe('escapeMarkdown', () => {
  test('escapes <, >, &, `, *, _, #, [, ], |', () => {
    expect(escapeMarkdown('<')).toBe('\\<')
    expect(escapeMarkdown('>')).toBe('\\>')
    expect(escapeMarkdown('&')).toBe('\\&')
    expect(escapeMarkdown('`')).toBe('\\`')
    expect(escapeMarkdown('*')).toBe('\\*')
    expect(escapeMarkdown('_')).toBe('\\_')
    expect(escapeMarkdown('#')).toBe('\\#')
    expect(escapeMarkdown('[')).toBe('\\[')
    expect(escapeMarkdown(']')).toBe('\\]')
    expect(escapeMarkdown('|')).toBe('\\|')
  })

  test('uses backslash prefix for escaping', () => {
    expect(escapeMarkdown('*bold*')).toBe('\\*bold\\*')
    expect(escapeMarkdown('# heading')).toBe('\\# heading')
  })

  test('handles strings with multiple special characters', () => {
    expect(escapeMarkdown('**bold** and `code`')).toBe('\\*\\*bold\\*\\* and \\`code\\`')
  })

  test('handles strings with no special characters', () => {
    expect(escapeMarkdown('Hello World 123')).toBe('Hello World 123')
  })

  test('handles empty string', () => {
    expect(escapeMarkdown('')).toBe('')
  })
})
