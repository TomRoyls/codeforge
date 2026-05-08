import { describe, it, expect } from 'vitest'
import { CodeFormatter } from '../../src/core/code-formatter/code-formatter.js'
import type { FormatOptions, FormatResult, FormatRange, FormatError, ChangeDescription } from '../../src/core/code-formatter/types.js'
import { DEFAULT_FORMAT_OPTIONS } from '../../src/core/code-formatter/types.js'

describe('CodeFormatter', () => {
  describe('constructor', () => {
    it('should use default options when no options provided', () => {
      const formatter = new CodeFormatter()
      const opts = formatter.getOptions()
      expect(opts.indentSize).toBe(2)
      expect(opts.useTabs).toBe(false)
      expect(opts.semicolons).toBe(true)
      expect(opts.singleQuotes).toBe(true)
      expect(opts.trailingComma).toBe('all')
      expect(opts.printWidth).toBe(80)
      expect(opts.bracketSpacing).toBe(true)
      expect(opts.arrowParens).toBe('always')
      expect(opts.endOfLine).toBe('lf')
    })

    it('should accept partial custom options', () => {
      const formatter = new CodeFormatter({ indentSize: 4, useTabs: true })
      const opts = formatter.getOptions()
      expect(opts.indentSize).toBe(4)
      expect(opts.useTabs).toBe(true)
      expect(opts.semicolons).toBe(true)
    })

    it('should accept all custom options', () => {
      const formatter = new CodeFormatter({
        indentSize: 4,
        useTabs: true,
        semicolons: false,
        singleQuotes: false,
        trailingComma: 'none',
        printWidth: 120,
        bracketSpacing: false,
        arrowParens: 'avoid',
        endOfLine: 'crlf',
      })
      const opts = formatter.getOptions()
      expect(opts.indentSize).toBe(4)
      expect(opts.useTabs).toBe(true)
      expect(opts.semicolons).toBe(false)
      expect(opts.singleQuotes).toBe(false)
      expect(opts.trailingComma).toBe('none')
      expect(opts.printWidth).toBe(120)
      expect(opts.bracketSpacing).toBe(false)
      expect(opts.arrowParens).toBe('avoid')
      expect(opts.endOfLine).toBe('crlf')
    })
  })

  describe('mergeOptions', () => {
    it('should return a new CodeFormatter with merged options', () => {
      const formatter = new CodeFormatter({ indentSize: 2 })
      const merged = formatter.mergeOptions({ indentSize: 4 })
      expect(merged.getOptions().indentSize).toBe(4)
      expect(merged.getOptions().semicolons).toBe(true)
    })

    it('should not modify the original formatter', () => {
      const formatter = new CodeFormatter({ indentSize: 2 })
      formatter.mergeOptions({ indentSize: 4 })
      expect(formatter.getOptions().indentSize).toBe(2)
    })

    it('should preserve options not overridden', () => {
      const formatter = new CodeFormatter({ indentSize: 4, useTabs: true })
      const merged = formatter.mergeOptions({ singleQuotes: false })
      expect(merged.getOptions().indentSize).toBe(4)
      expect(merged.getOptions().useTabs).toBe(true)
      expect(merged.getOptions().singleQuotes).toBe(false)
    })
  })

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const formatter = new CodeFormatter()
      const opts = formatter.getOptions()
      opts.indentSize = 99
      expect(formatter.getOptions().indentSize).toBe(2)
    })
  })

  describe('format', () => {
    it('should return identity for already formatted code', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'hello';"
      const result = formatter.format(code)
      expect(result.changed).toBe(false)
    })

    it('should fix trailing whitespace', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'hello';   "
      const result = formatter.format(code)
      expect(result.changed).toBe(true)
      expect(result.formatted).toBe("const x = 'hello';")
    })

    it('should fix line endings to lf by default', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'hello';\r\nconst y = 'world';"
      const result = formatter.format(code)
      expect(result.formatted).not.toContain('\r\n')
      expect(result.formatted).toContain('\n')
    })

    it('should fix line endings to crlf when configured', () => {
      const formatter = new CodeFormatter({ endOfLine: 'crlf' })
      const code = "const x = 'hello';\nconst y = 'world';"
      const result = formatter.format(code)
      expect(result.formatted).toContain('\r\n')
      const lines = result.formatted.split('\r\n')
      expect(lines.length).toBeGreaterThan(1)
    })

    it('should fix quotes to single by default', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = "hello";'
      const result = formatter.format(code)
      expect(result.formatted).toContain("'hello'")
    })

    it('should fix quotes to double when singleQuotes is false', () => {
      const formatter = new CodeFormatter({ singleQuotes: false })
      const code = "const x = 'hello';"
      const result = formatter.format(code)
      expect(result.formatted).toContain('"hello"')
    })

    it('should add semicolons to statements by default', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'hello'"
      const result = formatter.format(code)
      expect(result.formatted).toContain("const x = 'hello';")
    })

    it('should not add semicolons when option is false', () => {
      const formatter = new CodeFormatter({ semicolons: false })
      const code = "const x = 'hello';"
      const result = formatter.format(code)
      expect(result.changed).toBe(false)
    })

    it('should normalize indentation from tabs to spaces', () => {
      const formatter = new CodeFormatter({ useTabs: false, indentSize: 2 })
      const code = 'const x = 1\n\tconst y = 2'
      const result = formatter.format(code)
      expect(result.formatted).toBe('const x = 1;\n  const y = 2;')
    })

    it('should normalize indentation from spaces to tabs', () => {
      const formatter = new CodeFormatter({ useTabs: true, indentSize: 2 })
      const code = 'const x = 1\n  const y = 2'
      const result = formatter.format(code)
      expect(result.formatted).toBe('const x = 1;\n\tconst y = 2;')
    })

    it('should return FormatResult with all fields', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('const x = 1')
      expect(result).toHaveProperty('formatted')
      expect(result).toHaveProperty('changed')
      expect(result).toHaveProperty('errors')
      expect(typeof result.formatted).toBe('string')
      expect(typeof result.changed).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('should return empty errors array for valid code', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format("const x = 'hello';")
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('formatRange', () => {
    it('should format only specified lines', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b';\nconst z = 'c';"
      const range: FormatRange = { startLine: 1, endLine: 1 }
      const result = formatter.formatRange(code, range)
      expect(result.formatted).toBe(code)
    })

    it('should leave lines outside range unchanged', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b'   \nconst z = 'c';"
      const range: FormatRange = { startLine: 1, endLine: 1 }
      const result = formatter.formatRange(code, range)
      expect(result.changed).toBe(true)
    })

    it('should handle range at start of code', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a'   \nconst y = 'b';\nconst z = 'c';"
      const range: FormatRange = { startLine: 0, endLine: 0 }
      const result = formatter.formatRange(code, range)
      expect(result.changed).toBe(true)
    })

    it('should handle range at end of code', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b';\nconst z = 'c'   "
      const range: FormatRange = { startLine: 2, endLine: 2 }
      const result = formatter.formatRange(code, range)
      expect(result.changed).toBe(true)
    })

    it('should return error for invalid range', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = 1;'
      const range: FormatRange = { startLine: -1, endLine: 5 }
      const result = formatter.formatRange(code, range)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.changed).toBe(false)
    })

    it('should return error when startLine > endLine', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = 1;\nconst y = 2;'
      const range: FormatRange = { startLine: 2, endLine: 1 }
      const result = formatter.formatRange(code, range)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle multi-line range', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b'   \nconst z = 'c'   "
      const range: FormatRange = { startLine: 1, endLine: 2 }
      const result = formatter.formatRange(code, range)
      expect(result.changed).toBe(true)
    })
  })

  describe('formatLine', () => {
    it('should format a single line', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b'   \nconst z = 'c';"
      const result = formatter.formatLine(code, 1)
      expect(result.changed).toBe(true)
    })

    it('should handle first line', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a'   \nconst y = 'b';"
      const result = formatter.formatLine(code, 0)
      expect(result.changed).toBe(true)
    })

    it('should handle last line', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b'   "
      const result = formatter.formatLine(code, 1)
      expect(result.changed).toBe(true)
    })

    it('should return error for out-of-range line number', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = 1;'
      const result = formatter.formatLine(code, 5)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.changed).toBe(false)
    })

    it('should return error for negative line number', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = 1;'
      const result = formatter.formatLine(code, -1)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should not change other lines', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a';\nconst y = 'b'   \nconst z = 'c';"
      const result = formatter.formatLine(code, 1)
      const lines = result.formatted.split('\n')
      expect(lines[0]).toBe("const x = 'a';")
      expect(lines[2]).toBe("const z = 'c';")
    })
  })

  describe('check', () => {
    it('should detect no changes for formatted code', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'hello';"
      const result = formatter.check(code)
      expect(result.changed).toBe(false)
      expect(result.changes).toHaveLength(0)
    })

    it('should detect changes needed', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = "hello";'
      const result = formatter.check(code)
      expect(result.changed).toBe(true)
      expect(result.changes.length).toBeGreaterThan(0)
    })

    it('should report change descriptions with line numbers', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = "hello";'
      const result = formatter.check(code)
      expect(result.changes[0]!.line).toBeGreaterThan(0)
      expect(result.changes[0]!.type).toBeDefined()
      expect(result.changes[0]!.message).toBeDefined()
    })

    it('should report multiple changes', () => {
      const formatter = new CodeFormatter()
      const code = "const x = 'a'   \nconst y = 'b'   "
      const result = formatter.check(code)
      expect(result.changes.length).toBeGreaterThanOrEqual(2)
    })

    it('should detect changes as ChangeDescription type', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = "hello";'
      const result = formatter.check(code)
      if (result.changes.length > 0) {
        const change: ChangeDescription = result.changes[0]!
        expect(typeof change.line).toBe('number')
        expect(typeof change.column).toBe('number')
        expect(typeof change.type).toBe('string')
        expect(typeof change.message).toBe('string')
      }
    })
  })

  describe('indent', () => {
    it('should indent code by one level', () => {
      const formatter = new CodeFormatter({ indentSize: 2 })
      const result = formatter.indent('const x = 1\nconst y = 2', 1)
      expect(result).toBe('  const x = 1\n  const y = 2')
    })

    it('should indent code by multiple levels', () => {
      const formatter = new CodeFormatter({ indentSize: 2 })
      const result = formatter.indent('const x = 1', 3)
      expect(result).toBe('      const x = 1')
    })

    it('should use tabs for indentation when configured', () => {
      const formatter = new CodeFormatter({ useTabs: true })
      const result = formatter.indent('const x = 1', 2)
      expect(result).toBe('\t\tconst x = 1')
    })

    it('should not indent empty lines', () => {
      const formatter = new CodeFormatter({ indentSize: 2 })
      const result = formatter.indent('const x = 1\n\nconst y = 2', 1)
      expect(result).toBe('  const x = 1\n\n  const y = 2')
    })

    it('should return unchanged code at level 0', () => {
      const formatter = new CodeFormatter()
      const code = 'const x = 1'
      const result = formatter.indent(code, 0)
      expect(result).toBe(code)
    })

    it('should handle custom indent size', () => {
      const formatter = new CodeFormatter({ indentSize: 4 })
      const result = formatter.indent('const x = 1', 1)
      expect(result).toBe('    const x = 1')
    })
  })

  describe('trimTrailingWhitespace', () => {
    it('should remove trailing spaces', () => {
      const formatter = new CodeFormatter()
      const result = formatter.trimTrailingWhitespace('const x = 1   ')
      expect(result).toBe('const x = 1')
    })

    it('should remove trailing tabs', () => {
      const formatter = new CodeFormatter()
      const result = formatter.trimTrailingWhitespace('const x = 1\t\t')
      expect(result).toBe('const x = 1')
    })

    it('should preserve content without trailing whitespace', () => {
      const formatter = new CodeFormatter()
      const result = formatter.trimTrailingWhitespace('const x = 1')
      expect(result).toBe('const x = 1')
    })

    it('should handle multiple lines', () => {
      const formatter = new CodeFormatter()
      const result = formatter.trimTrailingWhitespace('const x = 1   \nconst y = 2  ')
      expect(result).toBe('const x = 1\nconst y = 2')
    })

    it('should handle empty lines', () => {
      const formatter = new CodeFormatter()
      const result = formatter.trimTrailingWhitespace('   ')
      expect(result).toBe('')
    })
  })

  describe('normalizeLineEndings', () => {
    it('should convert CRLF to LF', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\r\nline2\r\nline3', 'lf')
      expect(result).toBe('line1\nline2\nline3')
    })

    it('should convert LF to CRLF', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\nline2\nline3', 'crlf')
      expect(result).toBe('line1\r\nline2\r\nline3')
    })

    it('should handle mixed line endings to LF', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\r\nline2\nline3\r\n', 'lf')
      expect(result).toBe('line1\nline2\nline3\n')
    })

    it('should handle mixed line endings to CRLF', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\nline2\r\nline3', 'crlf')
      expect(result).toBe('line1\r\nline2\r\nline3')
    })

    it('should handle bare CR', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\rline2', 'lf')
      expect(result).toBe('line1\nline2')
    })

    it('should handle already-normalized LF', () => {
      const formatter = new CodeFormatter()
      const result = formatter.normalizeLineEndings('line1\nline2', 'lf')
      expect(result).toBe('line1\nline2')
    })
  })

  describe('enforceSemicolons', () => {
    it('should add semicolons to const statements', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('const x = 1')
      expect(result).toBe('const x = 1;')
    })

    it('should add semicolons to let statements', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('let x = 1')
      expect(result).toBe('let x = 1;')
    })

    it('should add semicolons to return statements', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('return x')
      expect(result).toBe('return x;')
    })

    it('should add semicolons to throw statements', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('throw new Error()')
      expect(result).toBe('throw new Error();')
    })

    it('should not add duplicate semicolons', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('const x = 1;')
      expect(result).toBe('const x = 1;')
    })

    it('should not add semicolons after opening braces', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('if (true) {')
      expect(result).toBe('if (true) {')
    })

    it('should not add semicolons after closing braces', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('}')
      expect(result).toBe('}')
    })

    it('should not add semicolons to comments', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('// comment')
      expect(result).toBe('// comment')
    })

    it('should not add semicolons to lines ending with comma', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons("const obj = { a: '1',")
      expect(result).toBe("const obj = { a: '1',")
    })

    it('should handle export statements', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceSemicolons('export const x = 1')
      expect(result).toBe('export const x = 1;')
    })
  })

  describe('enforceQuotes', () => {
    it('should convert double quotes to single', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes('const x = "hello"', true)
      expect(result).toBe("const x = 'hello'")
    })

    it('should convert single quotes to double', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes("const x = 'hello'", false)
      expect(result).toBe('const x = "hello"')
    })

    it('should not change template literals', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes('const x = `hello`', true)
      expect(result).toBe('const x = `hello`')
    })

    it('should handle multiple strings on one line', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes('const x = "a" + "b"', true)
      expect(result).toBe("const x = 'a' + 'b'")
    })

    it('should handle nested quotes', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes("'it\\'s here'", false)
      expect(result).toBe('"it\'s here"')
    })

    it('should handle empty strings', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes('const x = ""', true)
      expect(result).toBe("const x = ''")
    })

    it('should preserve already-correct quotes', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes("const x = 'hello'", true)
      expect(result).toBe("const x = 'hello'")
    })

    it('should handle strings on multiple lines', () => {
      const formatter = new CodeFormatter()
      const result = formatter.enforceQuotes('const x = "a"\nconst y = "b"', true)
      expect(result).toBe("const x = 'a'\nconst y = 'b'")
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('')
      expect(result.formatted).toBe('')
      expect(result.changed).toBe(false)
    })

    it('should handle single line', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format("const x = 'hello';")
      expect(result.changed).toBe(false)
    })

    it('should handle single character', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('x')
      expect(result.formatted).toBe('x')
    })

    it('should handle very long lines', () => {
      const formatter = new CodeFormatter()
      const longStr = 'x'.repeat(200)
      const code = `const x = '${longStr}';`
      const result = formatter.format(code)
      expect(result.formatted).toContain(longStr)
    })

    it('should handle only whitespace', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('   \n   \n   ')
      expect(result.formatted).toBe('\n\n')
    })

    it('should handle newline-only string', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('\n\n')
      expect(result.formatted).toBe('\n\n')
    })

    it('should handle code with only comments', () => {
      const formatter = new CodeFormatter()
      const result = formatter.format('// comment')
      expect(result.formatted).toBe('// comment')
    })

    it('should handle mixed content', () => {
      const formatter = new CodeFormatter()
      const code = [
        "const x = 'a';",
        '',
        'function test() {',
        "  return 'b';",
        '}',
      ].join('\n')
      const result = formatter.format(code)
      expect(result.changed).toBe(false)
    })

    it('should handle FormatResult type correctly', () => {
      const formatter = new CodeFormatter()
      const result: FormatResult = formatter.format("const x = 'hello';")
      expect(typeof result.formatted).toBe('string')
      expect(typeof result.changed).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('should handle FormatOptions type correctly', () => {
      const opts: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS }
      expect(typeof opts.indentSize).toBe('number')
      expect(typeof opts.useTabs).toBe('boolean')
      expect(typeof opts.semicolons).toBe('boolean')
      expect(typeof opts.singleQuotes).toBe('boolean')
      expect(typeof opts.printWidth).toBe('number')
      expect(typeof opts.bracketSpacing).toBe('boolean')
    })

    it('should handle DEFAULT_FORMAT_OPTIONS values', () => {
      expect(DEFAULT_FORMAT_OPTIONS.indentSize).toBe(2)
      expect(DEFAULT_FORMAT_OPTIONS.useTabs).toBe(false)
      expect(DEFAULT_FORMAT_OPTIONS.semicolons).toBe(true)
      expect(DEFAULT_FORMAT_OPTIONS.singleQuotes).toBe(true)
      expect(DEFAULT_FORMAT_OPTIONS.trailingComma).toBe('all')
      expect(DEFAULT_FORMAT_OPTIONS.printWidth).toBe(80)
      expect(DEFAULT_FORMAT_OPTIONS.bracketSpacing).toBe(true)
      expect(DEFAULT_FORMAT_OPTIONS.arrowParens).toBe('always')
      expect(DEFAULT_FORMAT_OPTIONS.endOfLine).toBe('lf')
    })
  })
})
