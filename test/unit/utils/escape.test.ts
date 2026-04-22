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

  test('escapes ampersand first to prevent double-escaping', () => {
    expect(escapeXml('a&b<c>d"e\'f')).toBe('a&amp;b&lt;c&gt;d&quot;e&apos;f')
  })

  test('handles multiple ampersands', () => {
    expect(escapeXml('&&&')).toBe('&amp;&amp;&amp;')
  })

  test('handles multiple angle brackets', () => {
    expect(escapeXml('<<<>>>')).toBe('&lt;&lt;&lt;&gt;&gt;&gt;')
  })

  test('handles multiple quotes', () => {
    expect(escapeXml('"""\'\'\'')).toBe('&quot;&quot;&quot;&apos;&apos;&apos;')
  })

  test('handles string with only spaces', () => {
    expect(escapeXml('   ')).toBe('   ')
  })

  test('handles newlines', () => {
    expect(escapeXml('line1\nline2')).toBe('line1\nline2')
  })

  test('handles tabs', () => {
    expect(escapeXml('\t\t')).toBe('\t\t')
  })

  test('handles carriage returns', () => {
    expect(escapeXml('a\rb')).toBe('a\rb')
  })

  test('handles unicode characters', () => {
    expect(escapeXml('café 日本語 🎉')).toBe('café 日本語 🎉')
  })

  test('handles XML declaration', () => {
    expect(escapeXml('<?xml version="1.0"?>')).toBe('&lt;?xml version=&quot;1.0&quot;?&gt;')
  })

  test('handles CDATA-like content', () => {
    expect(escapeXml('<![CDATA[test]]>')).toBe('&lt;![CDATA[test]]&gt;')
  })

  test('handles XML comment-like content', () => {
    expect(escapeXml('<!-- comment -->')).toBe('&lt;!-- comment --&gt;')
  })

  test('handles attribute-like string', () => {
    expect(escapeXml('attr="value"')).toBe('attr=&quot;value&quot;')
  })

  test('handles nested tags string', () => {
    expect(escapeXml('<a><b></b></a>')).toBe('&lt;a&gt;&lt;b&gt;&lt;/b&gt;&lt;/a&gt;')
  })

  test('handles self-closing tag string', () => {
    expect(escapeXml('<br/>')).toBe('&lt;br/&gt;')
  })

  test('handles mixed content', () => {
    expect(escapeXml('Hello & "World" <test>')).toBe('Hello &amp; &quot;World&quot; &lt;test&gt;')
  })

  test('handles long string with no specials', () => {
    const long = 'a'.repeat(1000)
    expect(escapeXml(long)).toBe(long)
  })

  test('handles string of all specials', () => {
    expect(escapeXml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&apos;')
  })

  test('handles repeated escaping correctly', () => {
    const once = escapeXml('&')
    expect(once).toBe('&amp;')
    expect(escapeXml(once)).toBe('&amp;amp;')
    expect(escapeXml(escapeXml(once))).toBe('&amp;amp;amp;')
  })

  test('does not escape non-XML characters', () => {
    expect(escapeXml('@#$%^*()')).toBe('@#$%^*()')
  })

  test('handles backslash', () => {
    expect(escapeXml('\\')).toBe('\\')
  })

  test('handles forward slash', () => {
    expect(escapeXml('/')).toBe('/')
  })

  test('handles equals sign', () => {
    expect(escapeXml('=')).toBe('=')
  })

  test('handles question mark', () => {
    expect(escapeXml('?')).toBe('?')
  })

  test('handles exclamation mark', () => {
    expect(escapeXml('!')).toBe('!')
  })

  test('handles colon', () => {
    expect(escapeXml(':')).toBe(':')
  })

  test('handles semicolon', () => {
    expect(escapeXml(';')).toBe(';')
  })

  test('handles curly braces', () => {
    expect(escapeXml('{}')).toBe('{}')
  })

  test('handles square brackets', () => {
    expect(escapeXml('[]')).toBe('[]')
  })

  test('handles parentheses', () => {
    expect(escapeXml('()')).toBe('()')
  })

  test('handles pipe', () => {
    expect(escapeXml('|')).toBe('|')
  })

  test('handles tilde', () => {
    expect(escapeXml('~')).toBe('~')
  })

  test('handles backtick', () => {
    expect(escapeXml('`')).toBe('`')
  })

  test('handles comma', () => {
    expect(escapeXml(',')).toBe(',')
  })

  test('handles period', () => {
    expect(escapeXml('.')).toBe('.')
  })

  test('handles dash', () => {
    expect(escapeXml('-')).toBe('-')
  })

  test('handles underscore', () => {
    expect(escapeXml('_')).toBe('_')
  })

  test('handles plus', () => {
    expect(escapeXml('+')).toBe('+')
  })

  test('handles at sign', () => {
    expect(escapeXml('@')).toBe('@')
  })

  test('handles hash', () => {
    expect(escapeXml('#')).toBe('#')
  })

  test('handles dollar sign', () => {
    expect(escapeXml('$')).toBe('$')
  })

  test('handles percent', () => {
    expect(escapeXml('%')).toBe('%')
  })

  test('handles caret', () => {
    expect(escapeXml('^')).toBe('^')
  })

  test('handles asterisk', () => {
    expect(escapeXml('*')).toBe('*')
  })

  test('handles null character in string', () => {
    expect(escapeXml('\0')).toBe('\0')
  })

  test('handles string with mixed lengths of entity-free text', () => {
    expect(escapeXml('abc&def<ghi>jkl"mno\'pqr')).toBe(
      'abc&amp;def&lt;ghi&gt;jkl&quot;mno&apos;pqr',
    )
  })

  test('handles single ampersand in middle of word', () => {
    expect(escapeXml('Tom&Jerry')).toBe('Tom&amp;Jerry')
  })

  test('handles XML processing instruction', () => {
    expect(escapeXml('<?php echo "hi"; ?>')).toBe('&lt;?php echo &quot;hi&quot;; ?&gt;')
  })

  test('handles numeric character reference', () => {
    expect(escapeXml('&#65;')).toBe('&amp;#65;')
  })

  test('handles hex character reference', () => {
    expect(escapeXml('&#x41;')).toBe('&amp;#x41;')
  })

  test('handles string starting with special char', () => {
    expect(escapeXml('&start')).toBe('&amp;start')
  })

  test('handles string ending with special char', () => {
    expect(escapeXml('end<')).toBe('end&lt;')
  })

  test('handles consecutive different specials', () => {
    expect(escapeXml('"<>\'&')).toBe('&quot;&lt;&gt;&apos;&amp;')
  })

  test('handles long string with many ampersands', () => {
    expect(escapeXml('a&b&c&d&e&f&g&h')).toBe('a&amp;b&amp;c&amp;d&amp;e&amp;f&amp;g&amp;h')
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

  test('escapes ampersand in existing entity', () => {
    expect(escapeHtml('&amp;')).toBe('&amp;amp;')
    expect(escapeHtml('&nbsp;')).toBe('&amp;nbsp;')
  })

  test('handles HTML tag-like content', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  test('handles attribute value with quotes', () => {
    expect(escapeHtml('name="value"')).toBe('name=&quot;value&quot;')
  })

  test('handles attribute value with single quotes', () => {
    expect(escapeHtml("name='value'")).toBe('name=&#039;value&#039;')
  })

  test('handles HTML entity for less-than', () => {
    expect(escapeHtml('1 < 2')).toBe('1 &lt; 2')
  })

  test('handles HTML entity for greater-than', () => {
    expect(escapeHtml('2 > 1')).toBe('2 &gt; 1')
  })

  test('handles multiple ampersands', () => {
    expect(escapeHtml('a&b&c&d')).toBe('a&amp;b&amp;c&amp;d')
  })

  test('handles string with only spaces', () => {
    expect(escapeHtml('   ')).toBe('   ')
  })

  test('handles newlines', () => {
    expect(escapeHtml('line1\nline2')).toBe('line1\nline2')
  })

  test('handles tabs', () => {
    expect(escapeHtml('\t\t')).toBe('\t\t')
  })

  test('handles unicode characters', () => {
    expect(escapeHtml('café 日本語 🎉')).toBe('café 日本語 🎉')
  })

  test('handles self-closing tag', () => {
    expect(escapeHtml('<br/>')).toBe('&lt;br/&gt;')
  })

  test('handles closing tag', () => {
    expect(escapeHtml('</div>')).toBe('&lt;/div&gt;')
  })

  test('handles nested tags', () => {
    expect(escapeHtml('<p><b>bold</b></p>')).toBe('&lt;p&gt;&lt;b&gt;bold&lt;/b&gt;&lt;/p&gt;')
  })

  test('handles HTML comment', () => {
    expect(escapeHtml('<!-- test -->')).toBe('&lt;!-- test --&gt;')
  })

  test('handles doctype', () => {
    expect(escapeHtml('<!DOCTYPE html>')).toBe('&lt;!DOCTYPE html&gt;')
  })

  test('handles long string with no specials', () => {
    const long = 'x'.repeat(1000)
    expect(escapeHtml(long)).toBe(long)
  })

  test('handles string of all specials', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;')
  })

  test('escapes single quote differently from XML', () => {
    expect(escapeHtml("'")).toBe('&#039;')
    expect(escapeXml("'")).toBe('&apos;')
    expect(escapeHtml("'")).not.toBe(escapeXml("'"))
  })

  test('does not escape non-HTML characters', () => {
    expect(escapeHtml('@#$%^*()')).toBe('@#$%^*()')
  })

  test('handles backslash', () => {
    expect(escapeHtml('\\')).toBe('\\')
  })

  test('handles forward slash', () => {
    expect(escapeHtml('/')).toBe('/')
  })

  test('handles equals', () => {
    expect(escapeHtml('=')).toBe('=')
  })

  test('handles question mark', () => {
    expect(escapeHtml('?')).toBe('?')
  })

  test('handles exclamation', () => {
    expect(escapeHtml('!')).toBe('!')
  })

  test('handles colon', () => {
    expect(escapeHtml(':')).toBe(':')
  })

  test('handles semicolon', () => {
    expect(escapeHtml(';')).toBe(';')
  })

  test('handles curly braces', () => {
    expect(escapeHtml('{}')).toBe('{}')
  })

  test('handles square brackets', () => {
    expect(escapeHtml('[]')).toBe('[]')
  })

  test('handles parentheses', () => {
    expect(escapeHtml('()')).toBe('()')
  })

  test('handles pipe', () => {
    expect(escapeHtml('|')).toBe('|')
  })

  test('handles tilde', () => {
    expect(escapeHtml('~')).toBe('~')
  })

  test('handles backtick', () => {
    expect(escapeHtml('`')).toBe('`')
  })

  test('handles comma', () => {
    expect(escapeHtml(',')).toBe(',')
  })

  test('handles period', () => {
    expect(escapeHtml('.')).toBe('.')
  })

  test('handles dash', () => {
    expect(escapeHtml('-')).toBe('-')
  })

  test('handles underscore', () => {
    expect(escapeHtml('_')).toBe('_')
  })

  test('handles plus', () => {
    expect(escapeHtml('+')).toBe('+')
  })

  test('handles repeated escaping', () => {
    const once = escapeHtml('&')
    expect(once).toBe('&amp;')
    expect(escapeHtml(once)).toBe('&amp;amp;')
  })

  test('handles mixed content with all 5 entities', () => {
    expect(escapeHtml('a<b>c&d"e\'f')).toBe('a&lt;b&gt;c&amp;d&quot;e&#039;f')
  })

  test('handles text that looks like a URL', () => {
    expect(escapeHtml('https://example.com?a=1&b=2')).toBe('https://example.com?a=1&amp;b=2')
  })

  test('handles text with HTML attributes', () => {
    expect(escapeHtml('<a href="link" title=\'test\'>link</a>')).toBe(
      '&lt;a href=&quot;link&quot; title=&#039;test&#039;&gt;link&lt;/a&gt;',
    )
  })

  test('handles JSON-like string', () => {
    expect(escapeHtml('{"key": "value"}')).toBe('{&quot;key&quot;: &quot;value&quot;}')
  })

  test('handles carriage returns', () => {
    expect(escapeHtml('a\rb')).toBe('a\rb')
  })

  test('handles null character', () => {
    expect(escapeHtml('\0')).toBe('\0')
  })

  test('handles numeric character reference', () => {
    expect(escapeHtml('&#65;')).toBe('&amp;#65;')
  })

  test('handles string starting with special char', () => {
    expect(escapeHtml('&start')).toBe('&amp;start')
  })

  test('handles string ending with special char', () => {
    expect(escapeHtml('end<')).toBe('end&lt;')
  })

  test('handles textarea content', () => {
    expect(escapeHtml('<textarea>"value"</textarea>')).toBe(
      '&lt;textarea&gt;&quot;value&quot;&lt;/textarea&gt;',
    )
  })

  test('handles multiple lines with HTML tags', () => {
    expect(escapeHtml('<p>line1</p>\n<p>line2</p>')).toBe(
      '&lt;p&gt;line1&lt;/p&gt;\n&lt;p&gt;line2&lt;/p&gt;',
    )
  })

  test('handles string of repeated single quotes', () => {
    expect(escapeHtml("'''")).toBe('&#039;&#039;&#039;')
  })

  test('handles triple escaping', () => {
    const once = escapeHtml('<')
    const twice = escapeHtml(once)
    expect(twice).toBe('&amp;lt;')
    expect(escapeHtml(twice)).toBe('&amp;amp;lt;')
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

  test('escapes heading markers', () => {
    expect(escapeMarkdown('# H1')).toBe('\\# H1')
    expect(escapeMarkdown('## H2')).toBe('\\#\\# H2')
    expect(escapeMarkdown('### H3')).toBe('\\#\\#\\# H3')
  })

  test('escapes bold markers', () => {
    expect(escapeMarkdown('**bold**')).toBe('\\*\\*bold\\*\\*')
  })

  test('escapes italic markers', () => {
    expect(escapeMarkdown('*italic*')).toBe('\\*italic\\*')
    expect(escapeMarkdown('_italic_')).toBe('\\_italic\\_')
  })

  test('escapes code backticks', () => {
    expect(escapeMarkdown('`code`')).toBe('\\`code\\`')
  })

  test('escapes link syntax', () => {
    expect(escapeMarkdown('[link](url)')).toBe('\\[link\\](url)')
  })

  test('escapes table pipe', () => {
    expect(escapeMarkdown('a | b')).toBe('a \\| b')
  })

  test('escapes angle brackets for HTML in markdown', () => {
    expect(escapeMarkdown('<div>')).toBe('\\<div\\>')
  })

  test('handles string with only spaces', () => {
    expect(escapeMarkdown('   ')).toBe('   ')
  })

  test('handles newlines', () => {
    expect(escapeMarkdown('line1\nline2')).toBe('line1\nline2')
  })

  test('handles tabs', () => {
    expect(escapeMarkdown('\t\t')).toBe('\t\t')
  })

  test('handles unicode characters', () => {
    expect(escapeMarkdown('café 日本語 🎉')).toBe('café 日本語 🎉')
  })

  test('handles long string with no specials', () => {
    const long = 'z'.repeat(1000)
    expect(escapeMarkdown(long)).toBe(long)
  })

  test('handles string of all specials', () => {
    expect(escapeMarkdown('<>`*_#[]|&')).toBe('\\<\\>\\`\\*\\_\\#\\[\\]\\|\\&')
  })

  test('does not escape non-markdown characters', () => {
    expect(escapeMarkdown('@$%^()')).toBe('@$%^()')
  })

  test('handles backslash in input', () => {
    expect(escapeMarkdown('\\')).toBe('\\')
  })

  test('handles forward slash', () => {
    expect(escapeMarkdown('/')).toBe('/')
  })

  test('handles equals', () => {
    expect(escapeMarkdown('=')).toBe('=')
  })

  test('handles question mark', () => {
    expect(escapeMarkdown('?')).toBe('?')
  })

  test('handles exclamation', () => {
    expect(escapeMarkdown('!')).toBe('!')
  })

  test('handles colon', () => {
    expect(escapeMarkdown(':')).toBe(':')
  })

  test('handles semicolon', () => {
    expect(escapeMarkdown(';')).toBe(';')
  })

  test('handles curly braces', () => {
    expect(escapeMarkdown('{}')).toBe('{}')
  })

  test('handles parentheses', () => {
    expect(escapeMarkdown('()')).toBe('()')
  })

  test('handles comma', () => {
    expect(escapeMarkdown(',')).toBe(',')
  })

  test('handles period', () => {
    expect(escapeMarkdown('.')).toBe('.')
  })

  test('handles dash', () => {
    expect(escapeMarkdown('-')).toBe('-')
  })

  test('handles plus', () => {
    expect(escapeMarkdown('+')).toBe('+')
  })

  test('handles tilde', () => {
    expect(escapeMarkdown('~')).toBe('~')
  })

  test('handles double quotes', () => {
    expect(escapeMarkdown('"')).toBe('"')
  })

  test('handles single quotes', () => {
    expect(escapeMarkdown("'")).toBe("'")
  })

  test('handles dollar sign', () => {
    expect(escapeMarkdown('$')).toBe('$')
  })

  test('handles percent', () => {
    expect(escapeMarkdown('%')).toBe('%')
  })

  test('handles caret', () => {
    expect(escapeMarkdown('^')).toBe('^')
  })

  test('handles at sign', () => {
    expect(escapeMarkdown('@')).toBe('@')
  })

  test('handles markdown table row', () => {
    expect(escapeMarkdown('| Header | Value |')).toBe('\\| Header \\| Value \\|')
  })

  test('handles markdown link with pipe', () => {
    expect(escapeMarkdown('[link | text](url)')).toBe('\\[link \\| text\\](url)')
  })

  test('handles mixed bold and code', () => {
    expect(escapeMarkdown('**bold** and `code` and _italic_')).toBe(
      '\\*\\*bold\\*\\* and \\`code\\` and \\_italic\\_',
    )
  })

  test('handles markdown list item', () => {
    expect(escapeMarkdown('* item')).toBe('\\* item')
    expect(escapeMarkdown('- item')).toBe('- item')
  })

  test('handles markdown ordered list', () => {
    expect(escapeMarkdown('1. item')).toBe('1. item')
  })

  test('handles markdown blockquote', () => {
    expect(escapeMarkdown('> quote')).toBe('\\> quote')
  })

  test('handles markdown horizontal rule', () => {
    expect(escapeMarkdown('---')).toBe('---')
    expect(escapeMarkdown('***')).toBe('\\*\\*\\*')
  })

  test('handles image syntax', () => {
    expect(escapeMarkdown('![alt](src)')).toBe('!\\[alt\\](src)')
  })

  test('handles strikethrough', () => {
    expect(escapeMarkdown('~~strike~~')).toBe('~~strike~~')
  })

  test('handles footnote reference', () => {
    expect(escapeMarkdown('[^1]')).toBe('\\[^1\\]')
  })

  test('handles task list', () => {
    expect(escapeMarkdown('- [ ] task')).toBe('- \\[ \\] task')
    expect(escapeMarkdown('- [x] done')).toBe('- \\[x\\] done')
  })

  test('handles re-escaping escaped characters', () => {
    const once = escapeMarkdown('*')
    expect(once).toBe('\\*')
    expect(escapeMarkdown(once)).toBe('\\\\*')
  })

  test('handles markdown heading levels', () => {
    expect(escapeMarkdown('###### H6')).toBe('\\#\\#\\#\\#\\#\\# H6')
  })

  test('handles emphasis with underscores', () => {
    expect(escapeMarkdown('__bold__')).toBe('\\_\\_bold\\_\\_')
  })

  test('handles mixed inline code and emphasis', () => {
    expect(escapeMarkdown('use `x` for *emphasis*')).toBe('use \\`x\\` for \\*emphasis\\*')
  })

  test('handles HTML entity in markdown', () => {
    expect(escapeMarkdown('&amp;')).toBe('\\&amp;')
  })

  test('handles fenced code block markers', () => {
    expect(escapeMarkdown('```js')).toBe('\\`\\`\\`js')
  })

  test('handles markdown definition list', () => {
    expect(escapeMarkdown('term\n: definition')).toBe('term\n: definition')
  })

  test('escapes ampersand in text', () => {
    expect(escapeMarkdown('AT&T')).toBe('AT\\&T')
  })

  test('handles carriage returns', () => {
    expect(escapeMarkdown('a\rb')).toBe('a\rb')
  })

  test('handles null character', () => {
    expect(escapeMarkdown('\0')).toBe('\0')
  })

  test('handles string starting with special char', () => {
    expect(escapeMarkdown('# heading')).toBe('\\# heading')
  })

  test('handles string ending with special char', () => {
    expect(escapeMarkdown('text*')).toBe('text\\*')
  })

  test('handles markdown autolink', () => {
    expect(escapeMarkdown('<https://example.com>')).toBe('\\<https://example.com\\>')
  })

  test('handles markdown inline code with multiple backticks', () => {
    expect(escapeMarkdown('``code``')).toBe('\\`\\`code\\`\\`')
  })

  test('handles markdown reference-style link', () => {
    expect(escapeMarkdown('[link][ref]')).toBe('\\[link\\]\\[ref\\]')
  })

  test('handles string of repeated hashes', () => {
    expect(escapeMarkdown('###')).toBe('\\#\\#\\#')
  })

  test('handles string of repeated pipes', () => {
    expect(escapeMarkdown('|||')).toBe('\\|\\|\\|')
  })

  test('handles markdown bold-italic combo', () => {
    expect(escapeMarkdown('***bold italic***')).toBe('\\*\\*\\*bold italic\\*\\*\\*')
  })
})

describe('cross-function comparison', () => {
  test('all three handle empty string the same', () => {
    expect(escapeXml('')).toBe('')
    expect(escapeHtml('')).toBe('')
    expect(escapeMarkdown('')).toBe('')
  })

  test('all three handle plain text the same', () => {
    const plain = 'Hello World 123'
    expect(escapeXml(plain)).toBe(plain)
    expect(escapeHtml(plain)).toBe(plain)
    expect(escapeMarkdown(plain)).toBe(plain)
  })

  test('XML and HTML handle < the same', () => {
    expect(escapeXml('<')).toBe(escapeHtml('<'))
  })

  test('XML and HTML handle > the same', () => {
    expect(escapeXml('>')).toBe(escapeHtml('>'))
  })

  test('XML and HTML handle & the same', () => {
    expect(escapeXml('&')).toBe(escapeHtml('&'))
  })

  test('XML and HTML handle " the same', () => {
    expect(escapeXml('"')).toBe(escapeHtml('"'))
  })

  test('XML and HTML handle single quote differently', () => {
    expect(escapeXml("'")).toBe('&apos;')
    expect(escapeHtml("'")).toBe('&#039;')
    expect(escapeXml("'")).not.toBe(escapeHtml("'"))
  })

  test('all three return strings', () => {
    expect(typeof escapeXml('test')).toBe('string')
    expect(typeof escapeHtml('test')).toBe('string')
    expect(typeof escapeMarkdown('test')).toBe('string')
  })

  test('all three are idempotent for plain text', () => {
    const plain = 'abc123'
    expect(escapeXml(escapeXml(plain))).toBe(plain)
    expect(escapeHtml(escapeHtml(plain))).toBe(plain)
    expect(escapeMarkdown(escapeMarkdown(plain))).toBe(plain)
  })

  test('none of them escape spaces', () => {
    expect(escapeXml(' ')).toBe(' ')
    expect(escapeHtml(' ')).toBe(' ')
    expect(escapeMarkdown(' ')).toBe(' ')
  })

  test('none of them escape digits', () => {
    expect(escapeXml('0123456789')).toBe('0123456789')
    expect(escapeHtml('0123456789')).toBe('0123456789')
    expect(escapeMarkdown('0123456789')).toBe('0123456789')
  })

  test('none of them escape letters', () => {
    expect(escapeXml('abcXYZ')).toBe('abcXYZ')
    expect(escapeHtml('abcXYZ')).toBe('abcXYZ')
    expect(escapeMarkdown('abcXYZ')).toBe('abcXYZ')
  })

  test('all three handle spaces-only string identically', () => {
    const spaces = '    '
    expect(escapeXml(spaces)).toBe(spaces)
    expect(escapeHtml(spaces)).toBe(spaces)
    expect(escapeMarkdown(spaces)).toBe(spaces)
  })

  test('XML and HTML produce different output for strings with quotes', () => {
    expect(escapeXml("it's")).toBe('it&apos;s')
    expect(escapeHtml("it's")).toBe('it&#039;s')
    expect(escapeXml("it's")).not.toBe(escapeHtml("it's"))
  })

  test('Markdown escapes < while XML/HTML use entities', () => {
    expect(escapeXml('<')).toBe('&lt;')
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeMarkdown('<')).toBe('\\<')
  })

  test('all three handle newlines without modification', () => {
    const nl = '\n\n'
    expect(escapeXml(nl)).toBe(nl)
    expect(escapeHtml(nl)).toBe(nl)
    expect(escapeMarkdown(nl)).toBe(nl)
  })

  test('Markdown escapes more characters than XML or HTML', () => {
    const input = '*_#[]|'
    expect(escapeXml(input)).toBe(input)
    expect(escapeHtml(input)).toBe(input)
    expect(escapeMarkdown(input)).not.toBe(input)
  })

  test('all three return same result for whitespace-only strings', () => {
    const ws = ' \t \n '
    expect(escapeXml(ws)).toBe(ws)
    expect(escapeHtml(ws)).toBe(ws)
    expect(escapeMarkdown(ws)).toBe(ws)
  })
})
