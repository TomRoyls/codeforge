import { describe, it, expect } from 'vitest'
import {
  extractPatterns,
  isDuplicatePattern,
  addPatternToContent,
  removePatternFromContent,
  resolveIgnoreOptions,
  formatPatternList,
  formatNoFileMessage,
  formatAddResult,
  formatDuplicateWarning,
  formatRemoveResult,
} from '../src/commands/ignore-helpers.js'

// ─── extractPatterns ───────────────────────────────────
describe('extractPatterns', () => {
  it('extracts simple patterns', () => {
    expect(extractPatterns('node_modules/\ndist/\n')).toEqual(['node_modules/', 'dist/'])
  })

  it('filters out empty lines', () => {
    expect(extractPatterns('a\n\n\nb')).toEqual(['a', 'b'])
  })

  it('filters out comment lines', () => {
    expect(extractPatterns('# comment\npattern\n# another')).toEqual(['pattern'])
  })

  it('trims whitespace from each line', () => {
    expect(extractPatterns('  a  \n  b  ')).toEqual(['a', 'b'])
  })

  it('returns empty array for empty content', () => {
    expect(extractPatterns('')).toEqual([])
  })

  it('returns empty array for only comments and blanks', () => {
    expect(extractPatterns('# comment\n\n# another\n')).toEqual([])
  })

  it('preserves patterns that start with !', () => {
    expect(extractPatterns('!keep-me')).toEqual(['!keep-me'])
  })
})

// ─── isDuplicatePattern ────────────────────────────────
describe('isDuplicatePattern', () => {
  it('returns true for exact match', () => {
    expect(isDuplicatePattern(['node_modules/', 'dist/'], 'dist/')).toBe(true)
  })

  it('returns true ignoring whitespace', () => {
    expect(isDuplicatePattern(['  dist/  '], 'dist/')).toBe(true)
  })

  it('returns false for non-existing pattern', () => {
    expect(isDuplicatePattern(['node_modules/'], 'dist/')).toBe(false)
  })

  it('returns false for empty lines array', () => {
    expect(isDuplicatePattern([], 'dist/')).toBe(false)
  })

  it('trims the pattern before comparison', () => {
    expect(isDuplicatePattern(['dist/'], '  dist/  ')).toBe(true)
  })
})

// ─── addPatternToContent ───────────────────────────────
describe('addPatternToContent', () => {
  it('appends pattern to existing content', () => {
    const result = addPatternToContent('a\nb', 'c')
    expect(result).toBe('a\nb\nc')
  })

  it('returns just the pattern for empty content', () => {
    expect(addPatternToContent('', 'new-pattern')).toBe('new-pattern')
  })

  it('returns just the pattern for whitespace-only content', () => {
    expect(addPatternToContent('   ', 'new-pattern')).toBe('new-pattern')
  })

  it('handles single-line content', () => {
    expect(addPatternToContent('a', 'b')).toBe('a\nb')
  })
})

// ─── removePatternFromContent ──────────────────────────
describe('removePatternFromContent', () => {
  it('removes existing pattern', () => {
    const result = removePatternFromContent('a\nb\nc', 'b')
    expect(result.content).toBe('a\nc')
    expect(result.found).toBe(true)
  })

  it('returns unchanged content for non-existing pattern', () => {
    const result = removePatternFromContent('a\nb', 'z')
    expect(result.content).toBe('a\nb')
    expect(result.found).toBe(false)
  })

  it('matches ignoring whitespace', () => {
    const result = removePatternFromContent('a\n  b  \nc', 'b')
    expect(result.found).toBe(true)
  })

  it('removes only first occurrence', () => {
    const result = removePatternFromContent('a\nb\nb', 'b')
    expect(result.content).toBe('a\nb')
    expect(result.found).toBe(true)
  })

  it('handles removing from single-line content', () => {
    const result = removePatternFromContent('a', 'a')
    expect(result.content).toBe('')
    expect(result.found).toBe(true)
  })

  it('handles empty content', () => {
    const result = removePatternFromContent('', 'a')
    expect(result.found).toBe(false)
  })
})

// ─── resolveIgnoreOptions ──────────────────────────────
describe('resolveIgnoreOptions', () => {
  it('resolves action from args', () => {
    const opts = resolveIgnoreOptions({ action: 'add' }, { file: '.gitignore' })
    expect(opts.action).toBe('add')
  })

  it('resolves file from flags', () => {
    const opts = resolveIgnoreOptions({ action: 'list' }, { file: '.customignore' })
    expect(opts.file).toBe('.customignore')
  })

  it('resolves pattern from args when present', () => {
    const opts = resolveIgnoreOptions({ action: 'add', pattern: 'dist/' }, { file: '.gitignore' })
    expect(opts.pattern).toBe('dist/')
  })

  it('pattern is undefined when not provided', () => {
    const opts = resolveIgnoreOptions({ action: 'list' }, { file: '.gitignore' })
    expect(opts.pattern).toBeUndefined()
  })
})

// ─── formatPatternList ─────────────────────────────────
describe('formatPatternList', () => {
  it('logs header and file path', () => {
    const messages: string[] = []
    formatPatternList(['a', 'b'], '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('Ignore Patterns'))).toBe(true)
    expect(messages.some((m) => m.includes('.gitignore'))).toBe(true)
  })

  it('lists patterns', () => {
    const messages: string[] = []
    formatPatternList(['node_modules/', 'dist/'], '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('node_modules/'))).toBe(true)
    expect(messages.some((m) => m.includes('dist/'))).toBe(true)
  })

  it('shows empty state for no patterns', () => {
    const messages: string[] = []
    formatPatternList([], '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('empty'))).toBe(true)
  })

  it('shows singular count for one pattern', () => {
    const messages: string[] = []
    formatPatternList(['a'], '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('1 pattern found'))).toBe(true)
  })

  it('shows plural count for multiple patterns', () => {
    const messages: string[] = []
    formatPatternList(['a', 'b'], '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('2 patterns found'))).toBe(true)
  })
})

// ─── formatNoFileMessage ───────────────────────────────
describe('formatNoFileMessage', () => {
  it('logs file path', () => {
    const messages: string[] = []
    formatNoFileMessage('.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('.gitignore'))).toBe(true)
  })

  it('logs creation hint', () => {
    const messages: string[] = []
    formatNoFileMessage('.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('codeforge ignore add'))).toBe(true)
  })
})

// ─── formatAddResult ───────────────────────────────────
describe('formatAddResult', () => {
  it('logs success with pattern and file', () => {
    const messages: string[] = []
    formatAddResult('dist/', '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('dist/'))).toBe(true)
    expect(messages.some((m) => m.includes('.gitignore'))).toBe(true)
    expect(messages.some((m) => m.includes('Added'))).toBe(true)
  })
})

// ─── formatDuplicateWarning ────────────────────────────
describe('formatDuplicateWarning', () => {
  it('logs warning with pattern name', () => {
    const messages: string[] = []
    formatDuplicateWarning('dist/', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('dist/'))).toBe(true)
    expect(messages.some((m) => m.includes('already exists'))).toBe(true)
  })
})

// ─── formatRemoveResult ────────────────────────────────
describe('formatRemoveResult', () => {
  it('logs removal success with pattern and file', () => {
    const messages: string[] = []
    formatRemoveResult('dist/', '.gitignore', (msg) => messages.push(msg))
    expect(messages.some((m) => m.includes('dist/'))).toBe(true)
    expect(messages.some((m) => m.includes('.gitignore'))).toBe(true)
    expect(messages.some((m) => m.includes('Removed'))).toBe(true)
  })
})
