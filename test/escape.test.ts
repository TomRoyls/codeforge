import { describe, it, expect } from 'vitest'
import { escapeXml, escapeHtml, escapeMarkdown } from '../src/utils/escape.js'

// ─── escapeXml ────────────────────────────────────────
describe('escapeXml', () => {
  it('escapes ampersand', () => {
    expect(escapeXml('a&b')).toBe('a&amp;b')
  })

  it('escapes less than', () => {
    expect(escapeXml('a<b')).toBe('a&lt;b')
  })

  it('escapes greater than', () => {
    expect(escapeXml('a>b')).toBe('a&gt;b')
  })

  it('escapes double quotes', () => {
    expect(escapeXml('a"b')).toBe('a&quot;b')
  })

  it('escapes single quotes', () => {
    expect(escapeXml("a'b")).toBe('a&apos;b')
  })

  it('escapes all special characters', () => {
    expect(escapeXml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&apos;')
  })

  it('returns empty string unchanged', () => {
    expect(escapeXml('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(escapeXml('hello world')).toBe('hello world')
  })

  it('handles multiple occurrences', () => {
    expect(escapeXml('a&a&b')).toBe('a&amp;a&amp;b')
  })

  it('escapes ampersand first to avoid double escaping', () => {
    expect(escapeXml('&lt;')).toBe('&amp;lt;')
  })
})

// ─── escapeHtml ───────────────────────────────────────
describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a&b')).toBe('a&amp;b')
  })

  it('escapes less than', () => {
    expect(escapeHtml('a<b')).toBe('a&lt;b')
  })

  it('escapes greater than', () => {
    expect(escapeHtml('a>b')).toBe('a&gt;b')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('a"b')).toBe('a&quot;b')
  })

  it('escapes single quotes as numeric entity', () => {
    expect(escapeHtml("a'b")).toBe('a&#039;b')
  })

  it('escapes all special characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#039;')
  })

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(escapeHtml('hello')).toBe('hello')
  })

  it('handles script tag', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })
})

// ─── escapeMarkdown ───────────────────────────────────
describe('escapeMarkdown', () => {
  it('escapes angle brackets', () => {
    expect(escapeMarkdown('a<b>')).toBe(String.raw`a\<b\>`)
  })

  it('escapes ampersand', () => {
    expect(escapeMarkdown('a&b')).toBe(String.raw`a\&b`)
  })

  it('escapes backtick', () => {
    expect(escapeMarkdown('a`b')).toBe(String.raw`a\`b`)
  })

  it('escapes asterisk', () => {
    expect(escapeMarkdown('a*b')).toBe(String.raw`a\*b`)
  })

  it('escapes underscore', () => {
    expect(escapeMarkdown('a_b')).toBe(String.raw`a\_b`)
  })

  it('escapes hash', () => {
    expect(escapeMarkdown('# heading')).toBe(String.raw`\# heading`)
  })

  it('escapes square brackets', () => {
    expect(escapeMarkdown('[link]')).toBe(String.raw`\[link\]`)
  })

  it('escapes pipe', () => {
    expect(escapeMarkdown('a|b')).toBe(String.raw`a\|b`)
  })

  it('returns empty string unchanged', () => {
    expect(escapeMarkdown('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(escapeMarkdown('hello')).toBe('hello')
  })
})
