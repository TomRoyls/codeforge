import { describe, it, expect } from 'vitest'
import {
  CodeFormatter,
  DEFAULT_FORMAT_OPTIONS,
} from '../src/core/code-formatter/code-formatter.js'
import type {
  FormatOptions,
  FormatResult,
  FormatRange,
  FormatError,
  ChangeDescription,
} from '../src/core/code-formatter/types.js'

// ─── DEFAULT_FORMAT_OPTIONS ──────────────────────────────────────────
describe('DEFAULT_FORMAT_OPTIONS', () => {
  it('has indentSize of 2', () => {
    expect(DEFAULT_FORMAT_OPTIONS.indentSize).toBe(2)
  })

  it('has useTabs false', () => {
    expect(DEFAULT_FORMAT_OPTIONS.useTabs).toBe(false)
  })

  it('has semicolons true', () => {
    expect(DEFAULT_FORMAT_OPTIONS.semicolons).toBe(true)
  })

  it('has singleQuotes true', () => {
    expect(DEFAULT_FORMAT_OPTIONS.singleQuotes).toBe(true)
  })

  it('has trailingComma all', () => {
    expect(DEFAULT_FORMAT_OPTIONS.trailingComma).toBe('all')
  })

  it('has printWidth 80', () => {
    expect(DEFAULT_FORMAT_OPTIONS.printWidth).toBe(80)
  })

  it('has bracketSpacing true', () => {
    expect(DEFAULT_FORMAT_OPTIONS.bracketSpacing).toBe(true)
  })

  it('has arrowParens always', () => {
    expect(DEFAULT_FORMAT_OPTIONS.arrowParens).toBe('always')
  })

  it('has endOfLine lf', () => {
    expect(DEFAULT_FORMAT_OPTIONS.endOfLine).toBe('lf')
  })
})

// ─── Constructor ─────────────────────────────────────────────────────
describe('CodeFormatter constructor', () => {
  it('creates formatter with no arguments using defaults', () => {
    const fmt = new CodeFormatter()
    expect(fmt.getOptions()).toEqual(DEFAULT_FORMAT_OPTIONS)
  })

  it('accepts partial options overriding defaults', () => {
    const fmt = new CodeFormatter({ indentSize: 4 })
    const opts = fmt.getOptions()
    expect(opts.indentSize).toBe(4)
    expect(opts.semicolons).toBe(DEFAULT_FORMAT_OPTIONS.semicolons)
  })

  it('accepts multiple partial options', () => {
    const fmt = new CodeFormatter({ useTabs: true, semicolons: false, endOfLine: 'crlf' })
    const opts = fmt.getOptions()
    expect(opts.useTabs).toBe(true)
    expect(opts.semicolons).toBe(false)
    expect(opts.endOfLine).toBe('crlf')
    expect(opts.indentSize).toBe(DEFAULT_FORMAT_OPTIONS.indentSize)
  })

  it('does not mutate the defaults', () => {
    const before = { ...DEFAULT_FORMAT_OPTIONS }
    new CodeFormatter({ indentSize: 8 })
    expect(DEFAULT_FORMAT_OPTIONS).toEqual(before)
  })

  it('returns a copy from getOptions', () => {
    const fmt = new CodeFormatter()
    const opts = fmt.getOptions()
    opts.indentSize = 99
    expect(fmt.getOptions().indentSize).toBe(DEFAULT_FORMAT_OPTIONS.indentSize)
  })
})

// ─── getOptions ──────────────────────────────────────────────────────
describe('getOptions', () => {
  it('returns a shallow copy', () => {
    const fmt = new CodeFormatter()
    const a = fmt.getOptions()
    const b = fmt.getOptions()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})

// ─── mergeOptions ────────────────────────────────────────────────────
describe('mergeOptions', () => {
  it('returns a new CodeFormatter with merged options', () => {
    const original = new CodeFormatter({ indentSize: 2 })
    const merged = original.mergeOptions({ indentSize: 4 })
    expect(merged).not.toBe(original)
    expect(original.getOptions().indentSize).toBe(2)
    expect(merged.getOptions().indentSize).toBe(4)
  })

  it('preserves non-overridden options', () => {
    const original = new CodeFormatter({ indentSize: 2, useTabs: false })
    const merged = original.mergeOptions({ useTabs: true })
    expect(merged.getOptions().indentSize).toBe(2)
    expect(merged.getOptions().useTabs).toBe(true)
  })

  it('does not affect the original formatter', () => {
    const original = new CodeFormatter()
    original.mergeOptions({ semicolons: false, singleQuotes: false })
    expect(original.getOptions().semicolons).toBe(true)
    expect(original.getOptions().singleQuotes).toBe(true)
  })
})

// ─── normalizeLineEndings ────────────────────────────────────────────
describe('normalizeLineEndings', () => {
  const fmt = new CodeFormatter()

  it('converts CRLF to LF', () => {
    expect(fmt.normalizeLineEndings('a\r\nb\r\n', 'lf')).toBe('a\nb\n')
  })

  it('converts bare CR to LF', () => {
    expect(fmt.normalizeLineEndings('a\rb\rc', 'lf')).toBe('a\nb\nc')
  })

  it('converts mixed line endings to LF', () => {
    expect(fmt.normalizeLineEndings('a\r\nb\nc\rd', 'lf')).toBe('a\nb\nc\nd')
  })

  it('converts LF to CRLF when eol is crlf', () => {
    expect(fmt.normalizeLineEndings('a\nb\n', 'crlf')).toBe('a\r\nb\r\n')
  })

  it('converts CRLF to CRLF cleanly', () => {
    expect(fmt.normalizeLineEndings('a\r\nb\r\n', 'crlf')).toBe('a\r\nb\r\n')
  })

  it('handles empty string', () => {
    expect(fmt.normalizeLineEndings('', 'lf')).toBe('')
    expect(fmt.normalizeLineEndings('', 'crlf')).toBe('')
  })

  it('handles single line with no line endings', () => {
    expect(fmt.normalizeLineEndings('hello', 'lf')).toBe('hello')
    expect(fmt.normalizeLineEndings('hello', 'crlf')).toBe('hello')
  })

  it('handles string that is only line endings', () => {
    expect(fmt.normalizeLineEndings('\r\n\r\n', 'lf')).toBe('\n\n')
    expect(fmt.normalizeLineEndings('\n\n', 'crlf')).toBe('\r\n\r\n')
  })
})

// ─── trimTrailingWhitespace ─────────────────────────────────────────
describe('trimTrailingWhitespace', () => {
  const fmt = new CodeFormatter()

  it('removes trailing spaces', () => {
    expect(fmt.trimTrailingWhitespace('hello   ')).toBe('hello')
  })

  it('removes trailing tabs', () => {
    expect(fmt.trimTrailingWhitespace('hello\t\t')).toBe('hello')
  })

  it('removes mixed trailing whitespace', () => {
    expect(fmt.trimTrailingWhitespace('hello \t ')).toBe('hello')
  })

  it('preserves leading whitespace', () => {
    expect(fmt.trimTrailingWhitespace('  hello')).toBe('  hello')
  })

  it('preserves internal whitespace', () => {
    expect(fmt.trimTrailingWhitespace('hel lo')).toBe('hel lo')
  })

  it('handles multiple lines', () => {
    expect(fmt.trimTrailingWhitespace('a  \nb  \nc  ')).toBe('a\nb\nc')
  })

  it('handles empty string', () => {
    expect(fmt.trimTrailingWhitespace('')).toBe('')
  })

  it('handles line that is all whitespace', () => {
    expect(fmt.trimTrailingWhitespace('   ')).toBe('')
  })

  it('handles whitespace-only lines in multiline', () => {
    expect(fmt.trimTrailingWhitespace('a\n   \nb')).toBe('a\n\nb')
  })
})

// ─── enforceQuotes ───────────────────────────────────────────────────
describe('enforceQuotes', () => {
  const fmt = new CodeFormatter()

  it('converts double quotes to single quotes', () => {
    expect(fmt.enforceQuotes('const x = "hello"', true)).toBe("const x = 'hello'")
  })

  it('converts single quotes to double quotes', () => {
    expect(fmt.enforceQuotes("const x = 'hello'", false)).toBe('const x = "hello"')
  })

  it('leaves single quotes when single is true', () => {
    expect(fmt.enforceQuotes("const x = 'hello'", true)).toBe("const x = 'hello'")
  })

  it('leaves double quotes when single is false', () => {
    expect(fmt.enforceQuotes('const x = "hello"', false)).toBe('const x = "hello"')
  })

  it('handles empty string', () => {
    expect(fmt.enforceQuotes('', true)).toBe('')
  })

  it('handles code with no quotes', () => {
    expect(fmt.enforceQuotes('const x = 42', true)).toBe('const x = 42')
  })

  it('skips template literals', () => {
    const code = 'const x = `hello "world"`'
    expect(fmt.enforceQuotes(code, true)).toBe(code)
  })

  it('converts multiple strings on one line', () => {
    expect(fmt.enforceQuotes('"a" + "b"', true)).toBe("'a' + 'b'")
  })

  it('handles escaped quotes in source (double to single)', () => {
    const result = fmt.enforceQuotes('const x = "it\'s"', true)
    expect(result).toBe("const x = 'it\\'s'")
  })

  it('handles escaped quotes in source (single to double)', () => {
    const result = fmt.enforceQuotes("const x = 'he said \"hi\"'", false)
    expect(result).toBe('const x = "he said \\"hi\\""')
  })

  it('handles multiline code with mixed quotes', () => {
    const code = 'const a = "one"\nconst b = "two"'
    expect(fmt.enforceQuotes(code, true)).toBe("const a = 'one'\nconst b = 'two'")
  })

  it('preserves backticks with interpolation', () => {
    const code = 'const x = `${a}`'
    expect(fmt.enforceQuotes(code, true)).toBe(code)
  })

  it('handles adjacent strings', () => {
    expect(fmt.enforceQuotes('"a"+"b"', true)).toBe("'a'+'b'")
  })
})

// ─── enforceSemicolons ───────────────────────────────────────────────
describe('enforceSemicolons', () => {
  const fmt = new CodeFormatter()

  it('adds semicolons to const declarations', () => {
    expect(fmt.enforceSemicolons('const x = 1')).toBe('const x = 1;')
  })

  it('adds semicolons to let declarations', () => {
    expect(fmt.enforceSemicolons('let x = 1')).toBe('let x = 1;')
  })

  it('adds semicolons to var declarations', () => {
    expect(fmt.enforceSemicolons('var x = 1')).toBe('var x = 1;')
  })

  it('adds semicolons to return statements', () => {
    expect(fmt.enforceSemicolons('return x')).toBe('return x;')
  })

  it('adds semicolons to throw statements', () => {
    expect(fmt.enforceSemicolons('throw new Error()')).toBe('throw new Error();')
  })

  it('adds semicolons to break statements', () => {
    expect(fmt.enforceSemicolons('break')).toBe('break;')
  })

  it('adds semicolons to continue statements', () => {
    expect(fmt.enforceSemicolons('continue')).toBe('continue;')
  })

  it('adds semicolons to yield statements', () => {
    expect(fmt.enforceSemicolons('yield x')).toBe('yield x;')
  })

  it('adds semicolons to export statements', () => {
    expect(fmt.enforceSemicolons('export const x = 1')).toBe('export const x = 1;')
  })

  it('adds semicolons to import statements', () => {
    expect(fmt.enforceSemicolons('import fs from "fs"')).toBe('import fs from "fs";')
  })

  it('does not add semicolon when already present', () => {
    expect(fmt.enforceSemicolons('const x = 1;')).toBe('const x = 1;')
  })

  it('does not add semicolon to lines ending with comma', () => {
    expect(fmt.enforceSemicolons('const x = 1,')).toBe('const x = 1,')
  })

  it('does not add semicolon to lines ending with dot', () => {
    expect(fmt.enforceSemicolons('something.')).toBe('something.')
  })

  it('does not add semicolon to lines ending with colon', () => {
    expect(fmt.enforceSemicolons('case 1:')).toBe('case 1:')
  })

  it('does not add semicolon to lines ending with question mark', () => {
    expect(fmt.enforceSemicolons('x ? y')).toBe('x ? y')
  })

  it('does not add semicolon to lines ending with opening brace', () => {
    expect(fmt.enforceSemicolons('if (true) {')).toBe('if (true) {')
  })

  it('does not add semicolon to lines ending with opening paren', () => {
    expect(fmt.enforceSemicolons('fn(')).toBe('fn(')
  })

  it('does not add semicolon to lines ending with opening bracket', () => {
    expect(fmt.enforceSemicolons('arr[')).toBe('arr[')
  })

  it('does not add semicolon to lines ending with backtick', () => {
    expect(fmt.enforceSemicolons('const x = `hello`')).toBe('const x = `hello`')
  })

  it('does not add semicolon to comment lines', () => {
    expect(fmt.enforceSemicolons('// comment')).toBe('// comment')
  })

  it('does not add semicolon to block comment starts', () => {
    expect(fmt.enforceSemicolons('/* comment */')).toBe('/* comment */')
  })

  it('does not add semicolon to block comment continuation', () => {
    expect(fmt.enforceSemicolons(' * middle')).toBe(' * middle')
  })

  it('does not add semicolon to lines ending with closing brace', () => {
    expect(fmt.enforceSemicolons('}')).toBe('}')
  })

  it('does not add semicolon to lines ending with closing bracket', () => {
    expect(fmt.enforceSemicolons(']')).toBe(']')
  })

  it('does not add semicolon to lines ending with closing paren', () => {
    expect(fmt.enforceSemicolons(')')).toBe(')')
  })

  it('preserves indentation when adding semicolons', () => {
    expect(fmt.enforceSemicolons('  const x = 1')).toBe('  const x = 1;')
  })

  it('handles empty lines', () => {
    expect(fmt.enforceSemicolons('const x = 1\n\nconst y = 2')).toBe('const x = 1;\n\nconst y = 2;')
  })

  it('handles multiline code', () => {
    const input = 'const a = 1\nconst b = 2'
    expect(fmt.enforceSemicolons(input)).toBe('const a = 1;\nconst b = 2;')
  })
})

// ─── indent ──────────────────────────────────────────────────────────
describe('indent', () => {
  it('indents with spaces by default', () => {
    const fmt = new CodeFormatter({ indentSize: 2 })
    expect(fmt.indent('hello', 1)).toBe('  hello')
  })

  it('indents with custom indent size', () => {
    const fmt = new CodeFormatter({ indentSize: 4 })
    expect(fmt.indent('hello', 1)).toBe('    hello')
  })

  it('indents with tabs when useTabs is true', () => {
    const fmt = new CodeFormatter({ useTabs: true })
    expect(fmt.indent('hello', 1)).toBe('\thello')
  })

  it('indents multiple levels', () => {
    const fmt = new CodeFormatter({ indentSize: 2 })
    expect(fmt.indent('hello', 3)).toBe('      hello')
  })

  it('returns code unchanged when level is 0', () => {
    const fmt = new CodeFormatter()
    expect(fmt.indent('hello', 0)).toBe('hello')
  })

  it('returns code unchanged when level is negative', () => {
    const fmt = new CodeFormatter()
    expect(fmt.indent('hello', -1)).toBe('hello')
  })

  it('does not indent empty/whitespace-only lines', () => {
    const fmt = new CodeFormatter({ indentSize: 2 })
    expect(fmt.indent('hello\n\nworld', 1)).toBe('  hello\n\n  world')
  })

  it('indents each line in multiline code', () => {
    const fmt = new CodeFormatter({ indentSize: 2 })
    expect(fmt.indent('a\nb\nc', 1)).toBe('  a\n  b\n  c')
  })

  it('preserves existing indentation and adds more', () => {
    const fmt = new CodeFormatter({ indentSize: 2 })
    expect(fmt.indent('  hello', 1)).toBe('    hello')
  })

  it('handles tab indent with multiple levels', () => {
    const fmt = new CodeFormatter({ useTabs: true })
    expect(fmt.indent('hello', 2)).toBe('\t\thello')
  })
})

// ─── format ──────────────────────────────────────────────────────────
describe('format', () => {
  it('returns FormatResult with formatted, changed, errors', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('const x = 1')
    expect(result).toHaveProperty('formatted')
    expect(result).toHaveProperty('changed')
    expect(result).toHaveProperty('errors')
    expect(result.errors).toEqual([])
  })

  it('reports changed as false when no changes needed', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all', endOfLine: 'lf' })
    const result = fmt.format("const x = 'hello'\n")
    expect(result.changed).toBe(false)
  })

  it('reports changed as true when formatting applied', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('const x = 1  ')
    expect(result.changed).toBe(true)
  })

  it('trims trailing whitespace during format', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('hello   ')
    expect(result.formatted).toBe('hello')
  })

  it('normalizes line endings to lf by default', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('a\r\nb\r\n')
    expect(result.formatted).toBe('a\nb\n')
  })

  it('normalizes line endings to crlf when configured', () => {
    const fmt = new CodeFormatter({ endOfLine: 'crlf' })
    const result = fmt.format('a\nb\n')
    expect(result.formatted).toBe('a\r\nb\r\n')
  })

  it('converts double quotes to single by default', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('const x = "hello"')
    expect(result.formatted).toContain("'hello'")
  })

  it('does not convert quotes when singleQuotes is false', () => {
    const fmt = new CodeFormatter({ singleQuotes: false })
    const result = fmt.format('const x = "hello"')
    expect(result.formatted).toContain('"hello"')
  })

  it('adds semicolons when semicolons is true', () => {
    const fmt = new CodeFormatter({ semicolons: true })
    const result = fmt.format('const x = 1')
    expect(result.formatted).toContain(';')
  })

  it('does not add semicolons when semicolons is false', () => {
    const fmt = new CodeFormatter({ semicolons: false })
    const result = fmt.format('const x = 1')
    expect(result.formatted).not.toContain(';')
  })

  it('removes trailing commas when trailingComma is none', () => {
    const fmt = new CodeFormatter({ trailingComma: 'none' })
    const result = fmt.format('const obj = {a: 1, b: 2,}')
    expect(result.formatted).not.toMatch(/,\s*}/)
  })

  it('normalizes indentation from spaces to tabs when useTabs is true', () => {
    const fmt = new CodeFormatter({ useTabs: true, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('  hello')
    expect(result.formatted).toBe('\thello')
  })

  it('normalizes indentation from tabs to spaces by default', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const result = fmt.format('\thello')
    expect(result.formatted).toBe('  hello')
  })

  it('handles empty string', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('')
    expect(result.formatted).toBe('')
    expect(result.changed).toBe(false)
  })

  it('applies all formatting steps in correct order', () => {
    const fmt = new CodeFormatter()
    const input = '  const x = "hello"  \r\n'
    const result = fmt.format(input)
    expect(result.changed).toBe(true)
    expect(result.formatted).not.toContain('\r')
    expect(result.formatted).toContain("'hello'")
    expect(result.formatted).toContain(';')
  })

  it('handles code that is already formatted', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const input = "const x = 'hello'\n"
    const result = fmt.format(input)
    expect(result.changed).toBe(false)
  })

  it('handles single-line code', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('const x = 1')
    expect(result.formatted).toBe('const x = 1;')
  })
})

// ─── formatRange ─────────────────────────────────────────────────────
describe('formatRange', () => {
  const fmt = new CodeFormatter()

  it('formats only the specified range', () => {
    const code = 'const a = 1\nconst b = "two"\nconst c = 3'
    const result = fmt.formatRange(code, { startLine: 1, endLine: 1 })
    expect(result.formatted).toContain("'two'")
    expect(result.formatted).not.toContain("'1'")
  })

  it('preserves lines outside the range', () => {
    const code = 'line0\nline1\nline2'
    const result = fmt.formatRange(code, { startLine: 1, endLine: 1 })
    const lines = result.formatted.split('\n')
    expect(lines[0]).toBe('line0')
    expect(lines[2]).toBe('line2')
  })

  it('returns error for negative startLine', () => {
    const result = fmt.formatRange('hello', { startLine: -1, endLine: 0 })
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]!.message).toBe('Invalid range')
    expect(result.changed).toBe(false)
    expect(result.formatted).toBe('hello')
  })

  it('returns error for endLine beyond code length', () => {
    const result = fmt.formatRange('hello', { startLine: 0, endLine: 5 })
    expect(result.errors).toHaveLength(1)
    expect(result.formatted).toBe('hello')
  })

  it('returns error when startLine > endLine', () => {
    const result = fmt.formatRange('hello\nworld', { startLine: 1, endLine: 0 })
    expect(result.errors).toHaveLength(1)
    expect(result.formatted).toBe('hello\nworld')
  })

  it('formats the full code when range covers all lines', () => {
    const code = 'const a = "x"\nconst b = "y"'
    const rangeResult = fmt.formatRange(code, { startLine: 0, endLine: 1 })
    const fullResult = fmt.format(code)
    expect(rangeResult.formatted).toBe(fullResult.formatted)
  })

  it('formats a single-line range', () => {
    const code = 'const a = "x"\nconst b = "y"\nconst c = "z"'
    const result = fmt.formatRange(code, { startLine: 0, endLine: 0 })
    const lines = result.formatted.split('\n')
    expect(lines[0]).toContain("'x'")
    expect(lines[1]).toBe('const b = "y"')
  })

  it('returns changed false when range already formatted', () => {
    const fmt2 = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const code = "const a = 'x'\nconst b = 'y'"
    const result = fmt2.formatRange(code, { startLine: 0, endLine: 0 })
    expect(result.changed).toBe(false)
  })

  it('returns changed true when formatting applied to range', () => {
    const code = 'const a = "x"\nconst b = "y"'
    const result = fmt.formatRange(code, { startLine: 0, endLine: 0 })
    expect(result.changed).toBe(true)
  })

  it('handles trailing whitespace in range', () => {
    const code = 'hello   \nworld'
    const result = fmt.formatRange(code, { startLine: 0, endLine: 0 })
    expect(result.formatted.split('\n')[0]).toBe('hello')
  })
})

// ─── formatLine ──────────────────────────────────────────────────────
describe('formatLine', () => {
  const fmt = new CodeFormatter()

  it('formats a single line by number', () => {
    const code = 'hello   \nworld'
    const result = fmt.formatLine(code, 0)
    expect(result.formatted.split('\n')[0]).toBe('hello')
  })

  it('normalizes indentation on the target line', () => {
    const fmt2 = new CodeFormatter({ useTabs: true, semicolons: false, trailingComma: 'all' })
    const code = '    hello\nworld'
    const result = fmt2.formatLine(code, 0)
    expect(result.formatted.split('\n')[0]).toBe('\t\thello')
  })

  it('preserves other lines', () => {
    const code = 'hello   \nworld   \nfoo'
    const result = fmt.formatLine(code, 1)
    const lines = result.formatted.split('\n')
    expect(lines[0]).toBe('hello   ')
    expect(lines[1]).toBe('world')
    expect(lines[2]).toBe('foo')
  })

  it('returns error for negative line number', () => {
    const result = fmt.formatLine('hello', -1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]!.message).toBe('Line number out of range')
    expect(result.changed).toBe(false)
  })

  it('returns error for line number beyond range', () => {
    const result = fmt.formatLine('hello', 5)
    expect(result.errors).toHaveLength(1)
    expect(result.changed).toBe(false)
    expect(result.formatted).toBe('hello')
  })

  it('returns changed false when line already formatted', () => {
    const code = 'hello\nworld'
    const result = fmt.formatLine(code, 0)
    expect(result.changed).toBe(false)
  })

  it('returns changed true when line needs formatting', () => {
    const code = 'hello   \nworld'
    const result = fmt.formatLine(code, 0)
    expect(result.changed).toBe(true)
  })

  it('handles formatting the last line', () => {
    const code = 'hello\nworld   '
    const result = fmt.formatLine(code, 1)
    expect(result.formatted.split('\n')[1]).toBe('world')
  })

  it('handles formatting line 0 of single-line code', () => {
    const result = fmt.formatLine('hello   ', 0)
    expect(result.formatted).toBe('hello')
  })
})

// ─── check ───────────────────────────────────────────────────────────
describe('check', () => {
  const fmt = new CodeFormatter()

  it('returns changed false when no formatting needed', () => {
    const fmt2 = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const result = fmt2.check("const x = 'hello'\n")
    expect(result.changed).toBe(false)
    expect(result.changes).toEqual([])
  })

  it('returns changed true when formatting changes code', () => {
    const result = fmt.check('const x = 1  ')
    expect(result.changed).toBe(true)
    expect(result.changes.length).toBeGreaterThan(0)
  })

  it('reports modified lines', () => {
    const result = fmt.check('const x = 1  ')
    const change = result.changes.find((c) => c.type === 'modify')
    expect(change).toBeDefined()
    expect(change!.message).toBe('Line modified')
  })

  it('reports added lines', () => {
    const fmt2 = new CodeFormatter()
    const code = 'const x = 1'
    const result = fmt2.check(code)
    if (result.changes.length > 0) {
      expect(result.changes[0]!.line).toBeGreaterThanOrEqual(1)
    }
  })

  it('describes each change with line, column, type, message', () => {
    const result = fmt.check('const x = "hello"  ')
    expect(result.changes.length).toBeGreaterThan(0)
    for (const change of result.changes) {
      expect(change).toHaveProperty('line')
      expect(change).toHaveProperty('column')
      expect(change).toHaveProperty('type')
      expect(change).toHaveProperty('message')
    }
  })

  it('handles multi-line changes', () => {
    const code = 'const a = "x"  \nconst b = "y"  '
    const result = fmt.check(code)
    expect(result.changed).toBe(true)
    expect(result.changes.length).toBeGreaterThanOrEqual(2)
  })

  it('uses 1-based line numbers', () => {
    const result = fmt.check('const x = 1  ')
    if (result.changes.length > 0) {
      expect(result.changes[0]!.line).toBeGreaterThanOrEqual(1)
    }
  })

  it('change type is one of add, remove, modify', () => {
    const result = fmt.check('const x = "hello"  ')
    const validTypes = ['add', 'remove', 'modify']
    for (const change of result.changes) {
      expect(validTypes).toContain(change.type)
    }
  })
})

// ─── normalizeIndentation (via format) ───────────────────────────────
describe('normalizeIndentation', () => {
  it('converts 2-space indent to 4-space indent', () => {
    const fmt = new CodeFormatter({ indentSize: 4, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('  hello')
    expect(result.formatted).toBe('    hello')
  })

  it('converts 4-space indent to 2 tabs', () => {
    const fmt = new CodeFormatter({ useTabs: true, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('    hello')
    expect(result.formatted).toBe('\t\thello')
  })

  it('converts tabs to spaces', () => {
    const fmt = new CodeFormatter({ useTabs: false, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('\thello')
    expect(result.formatted).toBe('  hello')
  })

  it('converts spaces to tabs', () => {
    const fmt = new CodeFormatter({ useTabs: true, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('  hello')
    expect(result.formatted).toBe('\thello')
  })

  it('handles multiple levels of indentation', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const result = fmt.format('    hello')
    expect(result.formatted).toBe('    hello')
  })

  it('clears whitespace-only lines', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const result = fmt.format('    \nhello')
    expect(result.formatted.split('\n')[0]).toBe('')
  })

  it('handles mixed indentation in same code', () => {
    const fmt = new CodeFormatter({ indentSize: 2, semicolons: false, trailingComma: 'all' })
    const result = fmt.format('\thello\n  world')
    expect(result.formatted).toBe('  hello\n  world')
  })
})

// ─── trailingComma (via format) ──────────────────────────────────────
describe('trailingComma handling', () => {
  it('removes trailing commas when trailingComma is none', () => {
    const fmt = new CodeFormatter({ trailingComma: 'none', semicolons: false })
    const result = fmt.format('const obj = {a: 1, b: 2,}')
    expect(result.formatted).toBe('const obj = {a: 1, b: 2}')
  })

  it('removes trailing commas from arrays when trailingComma is none', () => {
    const fmt = new CodeFormatter({ trailingComma: 'none', semicolons: false })
    const result = fmt.format('const arr = [1, 2, 3,]')
    expect(result.formatted).toBe('const arr = [1, 2, 3]')
  })

  it('removes trailing commas from nested structures', () => {
    const fmt = new CodeFormatter({ trailingComma: 'none', semicolons: false })
    const result = fmt.format('const x = {a: [1,],}')
    expect(result.formatted).toBe('const x = {a: [1]}')
  })

  it('keeps trailing commas when trailingComma is all (default)', () => {
    const fmt = new CodeFormatter({ trailingComma: 'all', semicolons: false })
    const result = fmt.format('const obj = {a: 1, b: 2,}')
    expect(result.formatted).toContain(',}')
  })

  it('removes trailing comma before closing paren', () => {
    const fmt = new CodeFormatter({ trailingComma: 'none', semicolons: false })
    const result = fmt.format('fn(a, b,)')
    expect(result.formatted).toBe('fn(a, b)')
  })
})

// ─── Edge Cases ──────────────────────────────────────────────────────
describe('edge cases', () => {
  it('handles code with only whitespace', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format('   ')
    expect(result.formatted).toBe('')
    expect(result.changed).toBe(true)
  })

  it('handles code with only newlines', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const result = fmt.format('\n\n\n')
    expect(result.formatted).toBe('\n\n\n')
  })

  it('handles very long lines', () => {
    const fmt = new CodeFormatter()
    const longLine = 'const x = ' + 'a'.repeat(1000)
    const result = fmt.format(longLine)
    expect(result.formatted).toContain('const x =')
    expect(result.formatted).toContain(';')
  })

  it('handles Unicode content', () => {
    const fmt = new CodeFormatter()
    const result = fmt.format("const x = 'héllo wörld'")
    expect(result.formatted).toContain('héllo wörld')
  })

  it('handles code with only comments', () => {
    const fmt = new CodeFormatter({ semicolons: true })
    const result = fmt.format('// just a comment')
    expect(result.formatted).toBe('// just a comment')
  })

  it('handles mixed CRLF/LF/CR in same document', () => {
    const fmt = new CodeFormatter()
    const code = 'a\r\nb\nc\rd'
    const result = fmt.format(code)
    expect(result.formatted).not.toContain('\r')
    expect(result.formatted.split('\n')).toHaveLength(4)
  })

  it('formatRange with exact single line code', () => {
    const fmt = new CodeFormatter()
    const result = fmt.formatRange('const x = "hello"', { startLine: 0, endLine: 0 })
    expect(result.formatted).toContain("'hello'")
  })

  it('formatLine does not add semicolons (only trims and reindents)', () => {
    const fmt = new CodeFormatter({ semicolons: true })
    const result = fmt.formatLine('const x = 1   ', 0)

    expect(result.formatted).toBe('const x = 1')
  })

  it('check returns empty changes for identical code', () => {
    const fmt = new CodeFormatter({ semicolons: false, trailingComma: 'all' })
    const code = "const x = 'hello'\n"
    const result = fmt.check(code)
    expect(result.changes).toEqual([])
    expect(result.changed).toBe(false)
  })

  it('handles deeply nested indentation', () => {
    const fmt = new CodeFormatter({ indentSize: 2, semicolons: false, trailingComma: 'all' })
    const code = '        hello'
    const result = fmt.format(code)
    expect(result.formatted).toBe('        hello')
  })

  it('handles tab-based indentation with indentSize configured', () => {
    const fmt = new CodeFormatter({ useTabs: true, semicolons: false, trailingComma: 'all' })
    const code = '    hello'
    const result = fmt.format(code)
    expect(result.formatted).toBe('\t\thello')
  })

  it('handles empty format options object', () => {
    const fmt = new CodeFormatter({})
    expect(fmt.getOptions()).toEqual(DEFAULT_FORMAT_OPTIONS)
  })

  it('multiple format calls are independent', () => {
    const fmt = new CodeFormatter()
    const r1 = fmt.format('const x = 1')
    const r2 = fmt.format('const y = 2')
    expect(r1.formatted).toContain('x')
    expect(r2.formatted).toContain('y')
  })
})

// ─── Type Exports ────────────────────────────────────────────────────
describe('type exports', () => {
  it('FormatResult has correct shape', () => {
    const fmt = new CodeFormatter()
    const result: FormatResult = fmt.format('hello')
    expect(typeof result.formatted).toBe('string')
    expect(typeof result.changed).toBe('boolean')
    expect(Array.isArray(result.errors)).toBe(true)
  })

  it('FormatError has correct shape', () => {
    const fmt = new CodeFormatter()
    const result = fmt.formatLine('hello', -1)
    const err: FormatError = result.errors[0]!
    expect(typeof err.line).toBe('number')
    expect(typeof err.column).toBe('number')
    expect(typeof err.message).toBe('string')
  })

  it('FormatRange has correct shape', () => {
    const range: FormatRange = { startLine: 0, endLine: 1 }
    expect(typeof range.startLine).toBe('number')
    expect(typeof range.endLine).toBe('number')
  })

  it('ChangeDescription has correct shape', () => {
    const fmt = new CodeFormatter()
    const result = fmt.check('const x = 1  ')
    if (result.changes.length > 0) {
      const change: ChangeDescription = result.changes[0]!
      expect(typeof change.line).toBe('number')
      expect(typeof change.column).toBe('number')
      expect(typeof change.type).toBe('string')
      expect(typeof change.message).toBe('string')
    }
  })

  it('FormatOptions interface is satisfied', () => {
    const opts: FormatOptions = {
      indentSize: 2,
      useTabs: false,
      semicolons: true,
      singleQuotes: true,
      trailingComma: 'all',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'lf',
    }
    const fmt = new CodeFormatter(opts)
    expect(fmt.getOptions()).toEqual(opts)
  })
})
