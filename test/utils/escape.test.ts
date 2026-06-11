import { describe, it, expect } from 'vitest'
import { escapeXml, escapeHtml, escapeMarkdown } from '../../src/utils/escape.js'

// ─── escapeXml ────────────────────────────────────────────
describe('escapeXml', () => {
  it('escapes ampersands', () => {
    expect(escapeXml('a&b')).toBe('a&amp;b')
  })

  it('escapes angle brackets', () => {
    expect(escapeXml('<div>')).toBe('&lt;div&gt;')
  })

  it('escapes quotes', () => {
    expect(escapeXml('"hello"')).toBe('&quot;hello&quot;')
    expect(escapeXml("'hello'")).toBe('&apos;hello&apos;')
  })

  it('leaves normal text unchanged', () => {
    expect(escapeXml('hello world')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(escapeXml('')).toBe('')
  })

  it('escapes multiple ampersands', () => {
    expect(escapeXml('a&b&c')).toBe('a&amp;b&amp;c')
  })

  it('escapes all special chars together', () => {
    expect(escapeXml('<a href="x&y">\'z\'</a>')).toBe('&lt;a href=&quot;x&amp;y&quot;&gt;&apos;z&apos;&lt;/a&gt;')
  })

  it('handles string with no special chars', () => {
    expect(escapeXml('plain text 123')).toBe('plain text 123')
  })

  it('escapes consecutive special chars', () => {
    expect(escapeXml('<<>>')).toBe('&lt;&lt;&gt;&gt;')
  })

  it('escapes only ampersand in mixed string', () => {
    expect(escapeXml('tom&jerry')).toBe('tom&amp;jerry')
  })
})

// ─── escapeHtml ───────────────────────────────────────────
describe('escapeHtml', () => {
  it('escapes all HTML entities', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('escapes ampersand before other chars', () => {
    expect(escapeHtml('a&b<c')).toBe('a&amp;b&lt;c')
  })

  it('leaves normal text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
  })

  it('escapes greater than', () => {
    expect(escapeHtml('a>b')).toBe('a&gt;b')
  })

  it('handles multiple ampersands', () => {
    expect(escapeHtml('a&b&c&d')).toBe('a&amp;b&amp;c&amp;d')
  })

  it('escapes complex HTML attribute', () => {
    expect(escapeHtml('<div class="test">')).toBe('&lt;div class=&quot;test&quot;&gt;')
  })
})

// ─── escapeMarkdown ───────────────────────────────────────
describe('escapeMarkdown', () => {
  it('escapes markdown special chars', () => {
    const result = escapeMarkdown('# heading *bold* `code`')
    expect(result).toContain('\\#')
    expect(result).toContain('\\*')
    expect(result).toContain('\\`')
  })

  it('leaves normal text unchanged', () => {
    expect(escapeMarkdown('hello world')).toBe('hello world')
  })

  it('escapes pipe characters', () => {
    expect(escapeMarkdown('a|b')).toBe('a\\|b')
  })

  it('escapes square brackets', () => {
    expect(escapeMarkdown('[link]')).toBe('\\[link\\]')
  })

  it('handles empty string', () => {
    expect(escapeMarkdown('')).toBe('')
  })

  it('escapes asterisks', () => {
    expect(escapeMarkdown('hello *world*')).toBe('hello \\*world\\*')
  })

  it('escapes backticks', () => {
    expect(escapeMarkdown('use `code`')).toBe('use \\`code\\`')
  })

  it('escapes pipe character', () => {
    expect(escapeMarkdown('a|b')).toBe('a\\|b')
  })

  it('escapes backslash', () => {
    expect(escapeMarkdown('a\\b')).toContain('\\')
  })

  it('escapes underscore', () => {
    expect(escapeMarkdown('hello_world')).toContain('\\_')
  })

  it('escapes hash heading', () => {
    expect(escapeMarkdown('# heading')).toContain('\\#')
  })

  it('escapes greater than', () => {
    expect(escapeMarkdown('a>b')).toContain('\\>')
  })

  it('escapes multiple special chars in sequence', () => {
    const result = escapeMarkdown('#*_`|[]')
    expect(result).toContain('\\#')
    expect(result).toContain('\\*')
    expect(result).toContain('\\`')
    expect(result).toContain('\\|')
  })

  it('round-trip: escaped markdown is different from original', () => {
    const original = '**bold** and `code`'
    const escaped = escapeMarkdown(original)
    expect(escaped).not.toBe(original)
    expect(escaped.length).toBeGreaterThan(original.length)
  })

  it('escapes angle bracket in markdown', () => {
    expect(escapeMarkdown('a<b')).toContain('\\<')
  })

  it('does not escape parenthesis by default', () => {
    expect(escapeMarkdown('(text)')).toBe('(text)')
  })
})
