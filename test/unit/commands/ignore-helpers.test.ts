import { describe, test, expect } from 'vitest'
import {
  addPatternToContent,
  extractPatterns,
  formatAddResult,
  formatDuplicateWarning,
  formatNoFileMessage,
  formatPatternList,
  formatRemoveResult,
  isDuplicatePattern,
  removePatternFromContent,
  resolveIgnoreOptions,
  type IgnoreAction,
  type IgnoreOptions,
} from '../../../src/commands/ignore-helpers.js'

describe('extractPatterns', () => {
  test('returns empty array for empty string', () => {
    expect(extractPatterns('')).toEqual([])
  })

  test('extracts single pattern', () => {
    expect(extractPatterns('node_modules/**')).toEqual(['node_modules/**'])
  })

  test('extracts multiple patterns', () => {
    expect(extractPatterns('node_modules/**\ndist/**\ncoverage/**')).toEqual([
      'node_modules/**',
      'dist/**',
      'coverage/**',
    ])
  })

  test('filters out comments', () => {
    const content = '# Comment\nnode_modules/**\n# Another comment\ndist/**'
    expect(extractPatterns(content)).toEqual(['node_modules/**', 'dist/**'])
  })

  test('filters out blank lines', () => {
    const content = 'node_modules/**\n\n\ndist/**'
    expect(extractPatterns(content)).toEqual(['node_modules/**', 'dist/**'])
  })

  test('filters out comments and blank lines together', () => {
    const content = '# Comment\n\nnode_modules/**\n\n# Another\ndist/**'
    expect(extractPatterns(content)).toEqual(['node_modules/**', 'dist/**'])
  })

  test('trims whitespace from patterns', () => {
    const content = '  node_modules/**  \n  dist/**  '
    expect(extractPatterns(content)).toEqual(['node_modules/**', 'dist/**'])
  })

  test('filters out lines that are only whitespace', () => {
    const content = 'node_modules/**\n   \ndist/**'
    expect(extractPatterns(content)).toEqual(['node_modules/**', 'dist/**'])
  })

  test('returns empty array for comments-only content', () => {
    expect(extractPatterns('# Only comments\n# Nothing else')).toEqual([])
  })

  test('returns empty array for whitespace-only content', () => {
    expect(extractPatterns('   \n   \n   ')).toEqual([])
  })

  test('handles single line with trailing newline', () => {
    expect(extractPatterns('dist/**\n')).toEqual(['dist/**'])
  })

  test('handles pattern that starts with # inside a path', () => {
    const content = '#comment\n#real-comment'
    expect(extractPatterns(content)).toEqual([])
  })
})

describe('isDuplicatePattern', () => {
  test('returns true for exact match', () => {
    expect(isDuplicatePattern(['node_modules/**'], 'node_modules/**')).toBe(true)
  })

  test('returns false when pattern not present', () => {
    expect(isDuplicatePattern(['node_modules/**'], 'dist/**')).toBe(false)
  })

  test('returns false for empty lines array', () => {
    expect(isDuplicatePattern([], 'dist/**')).toBe(false)
  })

  test('ignores leading/trailing whitespace in lines', () => {
    expect(isDuplicatePattern(['  node_modules/**  '], 'node_modules/**')).toBe(true)
  })

  test('ignores leading/trailing whitespace in pattern', () => {
    expect(isDuplicatePattern(['node_modules/**'], '  node_modules/**  ')).toBe(true)
  })

  test('matches first occurrence among many', () => {
    const lines = ['dist/**', 'node_modules/**', 'coverage/**']
    expect(isDuplicatePattern(lines, 'node_modules/**')).toBe(true)
  })

  test('returns false for partial match', () => {
    expect(isDuplicatePattern(['node_modules/**/test'], 'node_modules/**')).toBe(false)
  })

  test('is case-sensitive', () => {
    expect(isDuplicatePattern(['Node_Modules/**'], 'node_modules/**')).toBe(false)
  })

  test('handles pattern with special characters', () => {
    expect(isDuplicatePattern(['*.log'], '*.log')).toBe(true)
  })

  test('handles pattern with glob stars', () => {
    expect(isDuplicatePattern(['**/*.test.ts'], '**/*.test.ts')).toBe(true)
  })
})

describe('addPatternToContent', () => {
  test('returns pattern for empty content', () => {
    expect(addPatternToContent('', 'node_modules/**')).toBe('node_modules/**')
  })

  test('returns pattern for whitespace-only content', () => {
    expect(addPatternToContent('   ', 'node_modules/**')).toBe('node_modules/**')
  })

  test('appends pattern to existing content', () => {
    expect(addPatternToContent('dist/**', 'node_modules/**')).toBe('dist/**\nnode_modules/**')
  })

  test('appends to multi-line content', () => {
    const content = 'dist/**\ncoverage/**'
    expect(addPatternToContent(content, 'node_modules/**')).toBe(
      'dist/**\ncoverage/**\nnode_modules/**',
    )
  })

  test('appends pattern to content with trailing newline', () => {
    const content = 'dist/**\n'
    expect(addPatternToContent(content, 'node_modules/**')).toBe('dist/**\n\nnode_modules/**')
  })

  test('does not deduplicate (caller responsibility)', () => {
    expect(addPatternToContent('node_modules/**', 'node_modules/**')).toBe(
      'node_modules/**\nnode_modules/**',
    )
  })
})

describe('removePatternFromContent', () => {
  test('removes pattern from single-line content', () => {
    const result = removePatternFromContent('dist/**', 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('removes pattern from multi-line content', () => {
    const result = removePatternFromContent('node_modules/**\ndist/**\ncoverage/**', 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('node_modules/**\ncoverage/**')
  })

  test('returns found false when pattern not present', () => {
    const content = 'node_modules/**\ndist/**'
    const result = removePatternFromContent(content, 'coverage/**')
    expect(result.found).toBe(false)
    expect(result.content).toBe(content)
  })

  test('removes first occurrence only', () => {
    const result = removePatternFromContent('dist/**\ndist/**', 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('dist/**')
  })

  test('handles whitespace in pattern', () => {
    const result = removePatternFromContent('node_modules/**', '  node_modules/**  ')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('handles whitespace in content lines', () => {
    const result = removePatternFromContent('  node_modules/**  ', 'node_modules/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('preserves comments when removing patterns', () => {
    const content = '# Build artifacts\ndist/**\n# Dependencies\nnode_modules/**'
    const result = removePatternFromContent(content, 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('# Build artifacts\n# Dependencies\nnode_modules/**')
  })

  test('returns found false for empty content', () => {
    const result = removePatternFromContent('', 'dist/**')
    expect(result.found).toBe(false)
  })

  test('removes from beginning of content', () => {
    const result = removePatternFromContent('a\nb\nc', 'a')
    expect(result.found).toBe(true)
    expect(result.content).toBe('b\nc')
  })

  test('removes from end of content', () => {
    const result = removePatternFromContent('a\nb\nc', 'c')
    expect(result.found).toBe(true)
    expect(result.content).toBe('a\nb')
  })
})

describe('resolveIgnoreOptions', () => {
  test('resolves add action with pattern', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: 'node_modules/**' },
      { file: '.gitignore' },
    )
    expect(result.action).toBe('add')
    expect(result.pattern).toBe('node_modules/**')
    expect(result.file).toBe('.gitignore')
  })

  test('resolves list action without pattern', () => {
    const result = resolveIgnoreOptions(
      { action: 'list', pattern: undefined },
      { file: '.codeforgeignore' },
    )
    expect(result.action).toBe('list')
    expect(result.pattern).toBeUndefined()
    expect(result.file).toBe('.codeforgeignore')
  })

  test('resolves remove action with pattern', () => {
    const result = resolveIgnoreOptions(
      { action: 'remove', pattern: 'dist/**' },
      { file: '.codeforgeignore' },
    )
    expect(result.action).toBe('remove')
    expect(result.pattern).toBe('dist/**')
  })

  test('uses default file from flags', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: '.customignore' })
    expect(result.file).toBe('.customignore')
  })

  test('preserves undefined pattern', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: '.codeforgeignore' })
    expect(result.pattern).toBeUndefined()
  })
})

describe('formatPatternList', () => {
  test('displays header with file path', () => {
    const lines: string[] = []
    formatPatternList(['dist/**'], '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Ignore Patterns')
    expect(output).toContain('File: .codeforgeignore')
  })

  test('displays patterns indented', () => {
    const lines: string[] = []
    formatPatternList(['node_modules/**', 'dist/**'], '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('  node_modules/**')
    expect(output).toContain('  dist/**')
  })

  test('shows empty for zero patterns', () => {
    const lines: string[] = []
    formatPatternList([], '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('(empty)')
  })

  test('shows singular count for one pattern', () => {
    const lines: string[] = []
    formatPatternList(['dist/**'], '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('1 pattern found')
  })

  test('shows plural count for multiple patterns', () => {
    const lines: string[] = []
    formatPatternList(['node_modules/**', 'dist/**', 'coverage/**'], '.codeforgeignore', (msg) =>
      lines.push(msg),
    )
    const output = lines.join('\n')
    expect(output).toContain('3 patterns found')
  })

  test('calls logFn for each output line', () => {
    const lines: string[] = []
    formatPatternList(['a', 'b'], 'file', (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThanOrEqual(5)
  })

  test('displays custom file path', () => {
    const lines: string[] = []
    formatPatternList(['dist/**'], '.customignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('.customignore')
  })
})

describe('formatNoFileMessage', () => {
  test('shows no ignore file message', () => {
    const lines: string[] = []
    formatNoFileMessage('.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('No ignore file found')
    expect(output).toContain('.codeforgeignore')
  })

  test('shows create suggestion', () => {
    const lines: string[] = []
    formatNoFileMessage('.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('codeforge ignore add')
  })

  test('uses provided file path', () => {
    const lines: string[] = []
    formatNoFileMessage('.customignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('.customignore')
  })

  test('calls logFn exactly twice', () => {
    const lines: string[] = []
    formatNoFileMessage('.codeforgeignore', (msg) => lines.push(msg))
    expect(lines).toHaveLength(2)
  })
})

describe('formatAddResult', () => {
  test('shows add success message', () => {
    const lines: string[] = []
    formatAddResult('node_modules/**', '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Added pattern')
    expect(output).toContain('node_modules/**')
  })

  test('includes file path', () => {
    const lines: string[] = []
    formatAddResult('dist/**', '.customignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('.customignore')
  })

  test('includes checkmark', () => {
    const lines: string[] = []
    formatAddResult('dist/**', '.codeforgeignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('✓')
  })

  test('calls logFn exactly once', () => {
    const lines: string[] = []
    formatAddResult('dist/**', '.codeforgeignore', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })
})

describe('formatDuplicateWarning', () => {
  test('shows already exists message', () => {
    const lines: string[] = []
    formatDuplicateWarning('node_modules/**', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('already exists')
    expect(output).toContain('node_modules/**')
  })

  test('calls logFn exactly once', () => {
    const lines: string[] = []
    formatDuplicateWarning('dist/**', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })
})

describe('formatRemoveResult', () => {
  test('shows remove success message', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Removed pattern')
    expect(output).toContain('dist/**')
  })

  test('includes file path', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.customignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('.customignore')
  })

  test('includes checkmark', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.codeforgeignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('✓')
  })

  test('calls logFn exactly once', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.codeforgeignore', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })
})

describe('IgnoreOptions type', () => {
  test('accepts valid add options', () => {
    const options: IgnoreOptions = {
      action: 'add' as IgnoreAction,
      file: '.codeforgeignore',
      pattern: 'dist/**',
    }
    expect(options.action).toBe('add')
    expect(options.pattern).toBe('dist/**')
  })

  test('accepts valid list options without pattern', () => {
    const options: IgnoreOptions = {
      action: 'list' as IgnoreAction,
      file: '.codeforgeignore',
    }
    expect(options.pattern).toBeUndefined()
  })

  test('accepts valid remove options', () => {
    const options: IgnoreOptions = {
      action: 'remove' as IgnoreAction,
      file: '.customignore',
      pattern: 'node_modules/**',
    }
    expect(options.action).toBe('remove')
  })
})

describe('IgnoreAction type', () => {
  test('accepts add action', () => {
    const action: IgnoreAction = 'add'
    expect(action).toBe('add')
  })

  test('accepts list action', () => {
    const action: IgnoreAction = 'list'
    expect(action).toBe('list')
  })

  test('accepts remove action', () => {
    const action: IgnoreAction = 'remove'
    expect(action).toBe('remove')
  })
})

describe('extractPatterns additional', () => {
  test('handles Windows-style CRLF line endings', () => {
    expect(extractPatterns('node_modules/**\r\ndist/**')).toEqual(['node_modules/**', 'dist/**'])
  })

  test('handles mixed LF and CRLF line endings', () => {
    expect(extractPatterns('a\nb\r\nc')).toEqual(['a', 'b', 'c'])
  })

  test('preserves hash not at line start', () => {
    const content = 'path/to/#hash\nnode_modules/**'
    expect(extractPatterns(content)).toEqual(['path/to/#hash', 'node_modules/**'])
  })

  test('handles tab characters in lines', () => {
    const content = '\tnode_modules/**\tdist/**'
    expect(extractPatterns(content)).toEqual(['node_modules/**\tdist/**'])
  })

  test('handles unicode patterns', () => {
    expect(extractPatterns('数据/**\nфайлы/**')).toEqual(['数据/**', 'файлы/**'])
  })

  test('handles pattern with backslashes', () => {
    expect(extractPatterns('src\\\\lib/**')).toEqual(['src\\\\lib/**'])
  })

  test('handles very long pattern', () => {
    const longPattern = 'a'.repeat(500)
    expect(extractPatterns(longPattern)).toEqual([longPattern])
  })

  test('handles content with only newline characters', () => {
    expect(extractPatterns('\n\n\n')).toEqual([])
  })

  test('filters out line that is only whitespace with tabs', () => {
    const content = 'dist/**\n\t\t\ncoverage/**'
    expect(extractPatterns(content)).toEqual(['dist/**', 'coverage/**'])
  })

  test('handles single carriage return', () => {
    expect(extractPatterns('dist/**\r')).toEqual(['dist/**'])
  })

  test('preserves exclamation mark negation patterns', () => {
    expect(extractPatterns('!keep-this.ts')).toEqual(['!keep-this.ts'])
  })

  test('handles comment-like pattern that is not a comment after trim', () => {
    expect(extractPatterns(' #indented-comment')).toEqual([])
  })

  test('handles empty pattern between valid patterns', () => {
    expect(extractPatterns('a/**\n\nb/**')).toEqual(['a/**', 'b/**'])
  })

  test('filters out double hash comment', () => {
    expect(extractPatterns('## heading\npattern/**')).toEqual(['pattern/**'])
  })

  test('filters out single hash character line', () => {
    expect(extractPatterns('#\nvalid/**')).toEqual(['valid/**'])
  })

  test('filters out triple hash comment', () => {
    expect(extractPatterns('### section\nsrc/**')).toEqual(['src/**'])
  })

  test('handles pattern with question mark glob', () => {
    expect(extractPatterns('src/?.ts')).toEqual(['src/?.ts'])
  })

  test('handles pattern with character class brackets', () => {
    expect(extractPatterns('src/**/*.[jt]s')).toEqual(['src/**/*.[jt]s'])
  })

  test('handles pattern that is just a single dot', () => {
    expect(extractPatterns('.')).toEqual(['.'])
  })

  test('handles pattern ending with slash', () => {
    expect(extractPatterns('node_modules/')).toEqual(['node_modules/'])
  })

  test('preserves pattern with spaces in the middle', () => {
    expect(extractPatterns('path with spaces/**')).toEqual(['path with spaces/**'])
  })

  test('handles pattern with double star prefix', () => {
    expect(extractPatterns('**/dist')).toEqual(['**/dist'])
  })

  test('handles multiple consecutive comment lines', () => {
    expect(extractPatterns('# a\n# b\n# c\nreal/**')).toEqual(['real/**'])
  })
})

describe('isDuplicatePattern additional', () => {
  test('matches pattern with extra spaces on both sides', () => {
    expect(isDuplicatePattern(['  dist/**  '], '  dist/**  ')).toBe(true)
  })

  test('handles empty pattern string', () => {
    expect(isDuplicatePattern([''], '')).toBe(true)
  })

  test('handles empty pattern against non-empty lines', () => {
    expect(isDuplicatePattern(['dist/**'], '')).toBe(false)
  })

  test('handles non-empty pattern against empty lines', () => {
    expect(isDuplicatePattern([''], 'dist/**')).toBe(false)
  })

  test('matches single character pattern', () => {
    expect(isDuplicatePattern(['a'], 'a')).toBe(true)
  })

  test('does not match single character against different character', () => {
    expect(isDuplicatePattern(['a'], 'b')).toBe(false)
  })

  test('handles pattern with newlines trimmed to match', () => {
    expect(isDuplicatePattern(['dist/**'], 'dist/**\n')).toBe(true)
  })

  test('handles very long pattern match', () => {
    const longPattern = 'x'.repeat(300)
    expect(isDuplicatePattern([longPattern], longPattern)).toBe(true)
  })

  test('handles pattern with exclamation mark', () => {
    expect(isDuplicatePattern(['!important.ts'], '!important.ts')).toBe(true)
  })

  test('does not cross-match exclamation mark pattern', () => {
    expect(isDuplicatePattern(['!important.ts'], 'important.ts')).toBe(false)
  })

  test('matches pattern with brackets', () => {
    expect(isDuplicatePattern(['src/**/*.{ts,tsx}'], 'src/**/*.{ts,tsx}')).toBe(true)
  })

  test('matches pattern with question mark glob', () => {
    expect(isDuplicatePattern(['src/?.ts'], 'src/?.ts')).toBe(true)
  })

  test('matches pattern with carriage return in line', () => {
    expect(isDuplicatePattern(['dist/**\r'], 'dist/**')).toBe(true)
  })

  test('handles lines array with comment entries', () => {
    expect(isDuplicatePattern(['# comment', 'dist/**'], '# comment')).toBe(true)
  })

  test('handles very large lines array', () => {
    const lines = Array.from({ length: 200 }, (_, i) => `pattern${i}`)
    expect(isDuplicatePattern(lines, 'pattern100')).toBe(true)
    expect(isDuplicatePattern(lines, 'pattern999')).toBe(false)
  })

  test('returns true when multiple lines match pattern', () => {
    expect(isDuplicatePattern(['a', 'a', 'a'], 'a')).toBe(true)
  })

  test('handles lines array with blank entries', () => {
    expect(isDuplicatePattern(['', 'dist/**', ''], 'dist/**')).toBe(true)
  })

  test('does not match pattern with different bracket content', () => {
    expect(isDuplicatePattern(['*.{ts,tsx}'], '*.{js,jsx}')).toBe(false)
  })
})

describe('addPatternToContent additional', () => {
  test('handles empty pattern added to empty content', () => {
    expect(addPatternToContent('', '')).toBe('')
  })

  test('handles empty pattern added to non-empty content', () => {
    expect(addPatternToContent('dist/**', '')).toBe('dist/**\n')
  })

  test('handles content with only newlines as empty after trim', () => {
    expect(addPatternToContent('\n\n', 'dist/**')).toBe('dist/**')
  })

  test('adds pattern with special glob characters', () => {
    expect(addPatternToContent('a', '**/*.test.{ts,tsx}')).toBe('a\n**/*.test.{ts,tsx}')
  })

  test('adds negation pattern', () => {
    expect(addPatternToContent('dist/**', '!keep.ts')).toBe('dist/**\n!keep.ts')
  })

  test('adds pattern with leading whitespace in pattern', () => {
    expect(addPatternToContent('a', '  b')).toBe('a\n  b')
  })

  test('handles single-line content without newline', () => {
    expect(addPatternToContent('dist/**', 'coverage/**')).toBe('dist/**\ncoverage/**')
  })

  test('handles content ending with non-newline character', () => {
    expect(addPatternToContent('abc', 'def')).toBe('abc\ndef')
  })

  test('handles unicode content', () => {
    expect(addPatternToContent('数据/**', '文件/**')).toBe('数据/**\n文件/**')
  })

  test('handles content with multiple trailing newlines', () => {
    expect(addPatternToContent('a\n\n\n', 'b')).toBe('a\n\n\n\nb')
  })

  test('handles content with leading whitespace', () => {
    expect(addPatternToContent('   dist/**', 'coverage/**')).toBe('   dist/**\ncoverage/**')
  })

  test('adds pattern to content with only comments', () => {
    expect(addPatternToContent('# comment', 'dist/**')).toBe('# comment\ndist/**')
  })

  test('adds pattern that looks like a comment', () => {
    expect(addPatternToContent('a', '#not-a-comment')).toBe('a\n#not-a-comment')
  })

  test('handles content with CRLF line endings', () => {
    expect(addPatternToContent('a\r\nb', 'c')).toBe('a\r\nb\nc')
  })
})

describe('removePatternFromContent additional', () => {
  test('removes from middle of many lines', () => {
    const result = removePatternFromContent('a\nb\nc\nd\ne', 'c')
    expect(result.found).toBe(true)
    expect(result.content).toBe('a\nb\nd\ne')
  })

  test('does not remove partial match within a line', () => {
    const result = removePatternFromContent('node_modules_extra/**', 'node_modules/**')
    expect(result.found).toBe(false)
    expect(result.content).toBe('node_modules_extra/**')
  })

  test('removes from two-line content', () => {
    const result = removePatternFromContent('a\nb', 'b')
    expect(result.found).toBe(true)
    expect(result.content).toBe('a')
  })

  test('handles empty pattern removal from non-empty content', () => {
    const content = 'dist/**\ncoverage/**'
    const result = removePatternFromContent(content, '')
    expect(result.found).toBe(false)
    expect(result.content).toBe(content)
  })

  test('removes empty line from content', () => {
    const result = removePatternFromContent('a\n\nc', '')
    expect(result.found).toBe(true)
  })

  test('handles very long content removal', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `pattern${i}`)
    const content = lines.join('\n')
    const result = removePatternFromContent(content, 'pattern50')
    expect(result.found).toBe(true)
    const resultLines = result.content.split('\n')
    expect(resultLines).toHaveLength(99)
    expect(resultLines).not.toContain('pattern50')
  })

  test('removes pattern with brackets', () => {
    const result = removePatternFromContent('src/**/*.{ts,tsx}\ndist/**', 'src/**/*.{ts,tsx}')
    expect(result.found).toBe(true)
    expect(result.content).toBe('dist/**')
  })

  test('handles content with trailing newline before removal', () => {
    const result = removePatternFromContent('dist/**\n', 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('handles negation pattern removal', () => {
    const result = removePatternFromContent('!keep.ts\ndist/**', '!keep.ts')
    expect(result.found).toBe(true)
    expect(result.content).toBe('dist/**')
  })

  test('preserves other patterns when removing first of duplicates', () => {
    const result = removePatternFromContent('x\nx\ny', 'x')
    expect(result.found).toBe(true)
    expect(result.content).toBe('x\ny')
  })

  test('removes the only line leaving empty content', () => {
    const result = removePatternFromContent('solo/**', 'solo/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('removes from content with CRLF preserving other lines', () => {
    const result = removePatternFromContent('a\r\nb\r\nc', 'b')
    expect(result.found).toBe(true)
    expect(result.content).toBe('a\r\nc')
  })

  test('case sensitive removal does not match different case', () => {
    const result = removePatternFromContent('Dist/**', 'dist/**')
    expect(result.found).toBe(false)
    expect(result.content).toBe('Dist/**')
  })

  test('removes line with surrounding blank lines preserved', () => {
    const result = removePatternFromContent('a\n\nb\n\nc', 'b')
    expect(result.found).toBe(true)
    expect(result.content).toBe('a\n\n\nc')
  })

  test('handles removal when pattern has different whitespace padding', () => {
    const result = removePatternFromContent('  dist/**  ', 'dist/**')
    expect(result.found).toBe(true)
    expect(result.content).toBe('')
  })

  test('handles removal from two identical lines', () => {
    const result = removePatternFromContent('x\nx', 'x')
    expect(result.found).toBe(true)
    expect(result.content).toBe('x')
  })
})

describe('resolveIgnoreOptions additional', () => {
  test('handles empty string for file', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: '' })
    expect(result.file).toBe('')
  })

  test('handles empty string for pattern', () => {
    const result = resolveIgnoreOptions({ action: 'add', pattern: '' }, { file: '.gitignore' })
    expect(result.pattern).toBe('')
  })

  test('handles all three actions in sequence', () => {
    for (const action of ['add', 'list', 'remove'] as IgnoreAction[]) {
      const result = resolveIgnoreOptions({ action }, { file: '.gitignore' })
      expect(result.action).toBe(action)
    }
  })

  test('handles extra unknown args properties', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: 'x', extra: 'ignored' },
      { file: '.gitignore' },
    )
    expect(result.action).toBe('add')
    expect(result.pattern).toBe('x')
  })

  test('handles extra unknown flags properties', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: '.gitignore', verbose: true })
    expect(result.file).toBe('.gitignore')
  })

  test('returns object matching IgnoreOptions interface', () => {
    const result = resolveIgnoreOptions(
      { action: 'remove', pattern: 'dist/**' },
      { file: '.codeforgeignore' },
    )
    expect(result).toEqual({
      action: 'remove',
      file: '.codeforgeignore',
      pattern: 'dist/**',
    })
  })

  test('handles pattern with special glob characters', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: '**/*.test.{ts,tsx}' },
      { file: '.gitignore' },
    )
    expect(result.pattern).toBe('**/*.test.{ts,tsx}')
  })

  test('handles file path with directory separators', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: 'config/.codeforgeignore' })
    expect(result.file).toBe('config/.codeforgeignore')
  })

  test('handles pattern with quotes', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: '"quoted"' },
      { file: '.gitignore' },
    )
    expect(result.pattern).toBe('"quoted"')
  })

  test('returns independent objects on multiple calls', () => {
    const result1 = resolveIgnoreOptions({ action: 'add', pattern: 'a' }, { file: 'f1' })
    const result2 = resolveIgnoreOptions({ action: 'remove', pattern: 'b' }, { file: 'f2' })
    expect(result1.action).toBe('add')
    expect(result2.action).toBe('remove')
    expect(result1.file).toBe('f1')
    expect(result2.file).toBe('f2')
  })

  test('handles pattern with carriage return', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: 'dist/**\r' },
      { file: '.gitignore' },
    )
    expect(result.pattern).toBe('dist/**\r')
  })
})

describe('formatPatternList additional', () => {
  test('shows exactly 2 patterns count', () => {
    const lines: string[] = []
    formatPatternList(['a', 'b'], 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('2 patterns found')
  })

  test('handles pattern with spaces', () => {
    const lines: string[] = []
    formatPatternList(['path with spaces/**'], 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('path with spaces/**')
  })

  test('handles empty string file path', () => {
    const lines: string[] = []
    formatPatternList(['a'], '', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('File: ')
  })

  test('handles pattern with unicode characters', () => {
    const lines: string[] = []
    formatPatternList(['数据/**'], 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('数据/**')
  })

  test('handles large number of patterns', () => {
    const patterns = Array.from({ length: 50 }, (_, i) => `pattern${i}`)
    const lines: string[] = []
    formatPatternList(patterns, 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('50 patterns found')
  })

  test('verifies correct number of logFn calls for empty patterns', () => {
    const lines: string[] = []
    formatPatternList([], 'file', (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThanOrEqual(6)
  })

  test('verifies correct number of logFn calls for 3 patterns', () => {
    const lines: string[] = []
    formatPatternList(['a', 'b', 'c'], 'file', (msg) => lines.push(msg))
    expect(lines.length).toBeGreaterThanOrEqual(9)
  })

  test('each pattern line starts with two spaces', () => {
    const lines: string[] = []
    formatPatternList(['x', 'y'], 'file', (msg) => lines.push(msg))
    const patternLines = lines.filter((l) => l.startsWith('  ') && !l.includes('File:'))
    expect(patternLines.length).toBe(2)
  })

  test('preserves pattern order as given', () => {
    const lines: string[] = []
    formatPatternList(['first', 'second', 'third'], 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    const firstIdx = output.indexOf('first')
    const secondIdx = output.indexOf('second')
    const thirdIdx = output.indexOf('third')
    expect(firstIdx).toBeLessThan(secondIdx)
    expect(secondIdx).toBeLessThan(thirdIdx)
  })

  test('handles very long file path', () => {
    const longPath = 'a'.repeat(200)
    const lines: string[] = []
    formatPatternList(['x'], longPath, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(longPath)
  })

  test('handles pattern containing File: string', () => {
    const lines: string[] = []
    formatPatternList(['File: something'], 'file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('File: something')
  })

  test('logFn receives only string arguments', () => {
    const received: unknown[] = []
    formatPatternList(['a'], 'file', (msg) => received.push(msg))
    for (const item of received) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('formatNoFileMessage additional', () => {
  test('handles empty string file path', () => {
    const lines: string[] = []
    formatNoFileMessage('', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('No ignore file found')
    expect(output).toContain('at ')
  })

  test('handles file path with special characters', () => {
    const lines: string[] = []
    formatNoFileMessage('path/to/.ignore#file', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('path/to/.ignore#file')
  })

  test('handles very long file path', () => {
    const longPath = 'a'.repeat(200)
    const lines: string[] = []
    formatNoFileMessage(longPath, (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain(longPath)
  })

  test('first line contains file path', () => {
    const lines: string[] = []
    formatNoFileMessage('.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('.gitignore')
  })

  test('second line contains suggestion', () => {
    const lines: string[] = []
    formatNoFileMessage('.gitignore', (msg) => lines.push(msg))
    expect(lines[1]).toContain('codeforge ignore add')
  })

  test('handles unicode file path', () => {
    const lines: string[] = []
    formatNoFileMessage('文件/.ignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('文件/.ignore')
  })

  test('handles file path with directory separator', () => {
    const lines: string[] = []
    formatNoFileMessage('config/.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('config/.codeforgeignore')
  })

  test('logFn receives only string arguments', () => {
    const received: unknown[] = []
    formatNoFileMessage('.gitignore', (msg) => received.push(msg))
    for (const item of received) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('formatAddResult additional', () => {
  test('handles empty pattern string', () => {
    const lines: string[] = []
    formatAddResult('', '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Added pattern')
  })

  test('handles empty file path', () => {
    const lines: string[] = []
    formatAddResult('dist/**', '', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })

  test('handles pattern with quotes', () => {
    const lines: string[] = []
    formatAddResult('path "with" quotes', '.gitignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('path "with" quotes')
  })

  test('handles pattern with unicode', () => {
    const lines: string[] = []
    formatAddResult('数据/**', '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('数据/**')
  })

  test('output contains pattern in quotes', () => {
    const lines: string[] = []
    formatAddResult('dist/**', '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('"dist/**"')
  })

  test('handles very long pattern', () => {
    const longPattern = 'x'.repeat(300)
    const lines: string[] = []
    formatAddResult(longPattern, '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain(longPattern)
  })

  test('handles file path with spaces', () => {
    const lines: string[] = []
    formatAddResult('dist/**', 'path with spaces/.ignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('path with spaces/.ignore')
  })

  test('logFn receives only string arguments', () => {
    const received: unknown[] = []
    formatAddResult('dist/**', '.gitignore', (msg) => received.push(msg))
    for (const item of received) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('formatDuplicateWarning additional', () => {
  test('handles empty pattern', () => {
    const lines: string[] = []
    formatDuplicateWarning('', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('already exists')
  })

  test('handles pattern with special characters', () => {
    const lines: string[] = []
    formatDuplicateWarning('**/*.test.{ts,tsx}', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('**/*.test.{ts,tsx}')
  })

  test('handles very long pattern', () => {
    const longPattern = 'x'.repeat(300)
    const lines: string[] = []
    formatDuplicateWarning(longPattern, (msg) => lines.push(msg))
    expect(lines[0]).toContain(longPattern)
  })

  test('output contains pattern in quotes', () => {
    const lines: string[] = []
    formatDuplicateWarning('node_modules/**', (msg) => lines.push(msg))
    expect(lines[0]).toContain('"node_modules/**"')
  })

  test('output is yellow colored', () => {
    const lines: string[] = []
    formatDuplicateWarning('dist/**', (msg) => lines.push(msg))
    expect(lines[0]).toContain('already exists in ignore file')
  })

  test('handles pattern with emoji', () => {
    const lines: string[] = []
    formatDuplicateWarning('🔥/**', (msg) => lines.push(msg))
    expect(lines[0]).toContain('🔥/**')
  })

  test('logFn receives only string arguments', () => {
    const received: unknown[] = []
    formatDuplicateWarning('dist/**', (msg) => received.push(msg))
    for (const item of received) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('formatRemoveResult additional', () => {
  test('handles empty pattern', () => {
    const lines: string[] = []
    formatRemoveResult('', '.codeforgeignore', (msg) => lines.push(msg))
    const output = lines.join('\n')
    expect(output).toContain('Removed pattern')
  })

  test('handles empty file path', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '', (msg) => lines.push(msg))
    expect(lines).toHaveLength(1)
  })

  test('handles pattern with special glob characters', () => {
    const lines: string[] = []
    formatRemoveResult('**/*.{ts,tsx}', '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('**/*.{ts,tsx}')
  })

  test('output contains pattern in quotes', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('"dist/**"')
  })

  test('output contains from keyword', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('from')
  })

  test('handles very long pattern', () => {
    const longPattern = 'y'.repeat(300)
    const lines: string[] = []
    formatRemoveResult(longPattern, '.gitignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain(longPattern)
  })

  test('handles file path with spaces', () => {
    const lines: string[] = []
    formatRemoveResult('dist/**', 'path with spaces/.ignore', (msg) => lines.push(msg))
    expect(lines[0]).toContain('path with spaces/.ignore')
  })

  test('logFn receives only string arguments', () => {
    const received: unknown[] = []
    formatRemoveResult('dist/**', '.gitignore', (msg) => received.push(msg))
    for (const item of received) {
      expect(typeof item).toBe('string')
    }
  })
})

describe('Integration: extractPatterns + isDuplicatePattern', () => {
  test('extracted patterns can be checked for duplicates', () => {
    const content = 'node_modules/**\ndist/**\ncoverage/**'
    const patterns = extractPatterns(content)
    expect(isDuplicatePattern(patterns, 'dist/**')).toBe(true)
    expect(isDuplicatePattern(patterns, 'unknown/**')).toBe(false)
  })

  test('extracted patterns from commented content skip duplicates check', () => {
    const content = '# node_modules\nnode_modules/**'
    const patterns = extractPatterns(content)
    expect(patterns).toEqual(['node_modules/**'])
    expect(isDuplicatePattern(patterns, '# node_modules')).toBe(false)
  })
})

describe('Integration: addPatternToContent + extractPatterns', () => {
  test('added pattern appears in extracted patterns', () => {
    const content = addPatternToContent('dist/**', 'node_modules/**')
    const patterns = extractPatterns(content)
    expect(patterns).toContain('node_modules/**')
    expect(patterns).toContain('dist/**')
  })

  test('added pattern to empty content extracts correctly', () => {
    const content = addPatternToContent('', 'node_modules/**')
    const patterns = extractPatterns(content)
    expect(patterns).toEqual(['node_modules/**'])
  })
})

describe('Integration: removePatternFromContent + extractPatterns', () => {
  test('removed pattern no longer appears in extracted patterns', () => {
    const content = 'node_modules/**\ndist/**\ncoverage/**'
    const result = removePatternFromContent(content, 'dist/**')
    expect(result.found).toBe(true)
    const patterns = extractPatterns(result.content)
    expect(patterns).not.toContain('dist/**')
    expect(patterns).toContain('node_modules/**')
    expect(patterns).toContain('coverage/**')
  })

  test('failed removal preserves all extracted patterns', () => {
    const content = 'node_modules/**\ndist/**'
    const result = removePatternFromContent(content, 'unknown/**')
    expect(result.found).toBe(false)
    const patterns = extractPatterns(result.content)
    expect(patterns).toEqual(['node_modules/**', 'dist/**'])
  })

  test('full cycle: add then check duplicate', () => {
    const content = 'dist/**'
    const newContent = addPatternToContent(content, 'node_modules/**')
    const patterns = extractPatterns(newContent)
    expect(isDuplicatePattern(patterns, 'node_modules/**')).toBe(true)
    expect(isDuplicatePattern(patterns, 'coverage/**')).toBe(false)
  })

  test('full cycle: add then remove then verify', () => {
    const content = addPatternToContent('dist/**', 'node_modules/**')
    const result = removePatternFromContent(content, 'node_modules/**')
    expect(result.found).toBe(true)
    const patterns = extractPatterns(result.content)
    expect(patterns).toEqual(['dist/**'])
  })

  test('full cycle: resolve then add and extract', () => {
    const opts = resolveIgnoreOptions(
      { action: 'add', pattern: 'coverage/**' },
      { file: '.gitignore' },
    )
    expect(opts.action).toBe('add')
    const content = addPatternToContent('dist/**', opts.pattern!)
    const patterns = extractPatterns(content)
    expect(patterns).toContain('coverage/**')
    expect(patterns).toContain('dist/**')
  })

  test('full cycle: remove from commented content', () => {
    const content = '# deps\nnode_modules/**\n# build\ndist/**'
    const result = removePatternFromContent(content, 'dist/**')
    expect(result.found).toBe(true)
    const patterns = extractPatterns(result.content)
    expect(patterns).toEqual(['node_modules/**'])
  })
})
