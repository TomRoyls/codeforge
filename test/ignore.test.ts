import { describe, it, expect } from 'vitest'
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
  type IgnoreOptions,
} from '../src/commands/ignore-helpers.js'

// ─── extractPatterns ─────────────────────────────────
describe('extractPatterns', () => {
  it('extracts non-empty, non-comment lines', () => {
    const content = 'node_modules/**\n# comment\ndist/**\n\ncoverage/**'
    const patterns = extractPatterns(content)

    expect(patterns).toEqual(['node_modules/**', 'dist/**', 'coverage/**'])
  })

  it('returns empty array for empty content', () => {
    expect(extractPatterns('')).toEqual([])
  })

  it('returns empty array for comment-only content', () => {
    expect(extractPatterns('# only comments\n# another')).toEqual([])
  })

  it('trims whitespace from patterns', () => {
    expect(extractPatterns('  node_modules/**  ')).toEqual(['node_modules/**'])
  })

  it('handles single-line content', () => {
    expect(extractPatterns('node_modules/**')).toEqual(['node_modules/**'])
  })
})

// ─── isDuplicatePattern ──────────────────────────────
describe('isDuplicatePattern', () => {
  it('returns true when pattern already exists', () => {
    expect(isDuplicatePattern(['node_modules/**', 'dist/**'], 'dist/**')).toBe(true)
  })

  it('returns false when pattern does not exist', () => {
    expect(isDuplicatePattern(['node_modules/**'], 'dist/**')).toBe(false)
  })

  it('ignores whitespace differences', () => {
    expect(isDuplicatePattern(['  dist/**  '], 'dist/**')).toBe(true)
  })

  it('returns false for empty lines', () => {
    expect(isDuplicatePattern([''], 'dist/**')).toBe(false)
  })
})

// ─── addPatternToContent ─────────────────────────────
describe('addPatternToContent', () => {
  it('appends pattern to existing content', () => {
    const result = addPatternToContent('node_modules/**', 'dist/**')

    expect(result).toBe('node_modules/**\ndist/**')
  })

  it('returns pattern alone when content is empty', () => {
    const result = addPatternToContent('', 'dist/**')

    expect(result).toBe('dist/**')
  })

  it('returns pattern alone when content is whitespace-only', () => {
    const result = addPatternToContent('   ', 'dist/**')

    expect(result).toBe('dist/**')
  })
})

// ─── removePatternFromContent ────────────────────────
describe('removePatternFromContent', () => {
  it('removes a matching pattern', () => {
    const result = removePatternFromContent('node_modules/**\ndist/**', 'dist/**')

    expect(result.found).toBe(true)
    expect(result.content).toBe('node_modules/**')
  })

  it('returns found=false when pattern not present', () => {
    const result = removePatternFromContent('node_modules/**', 'dist/**')

    expect(result.found).toBe(false)
    expect(result.content).toBe('node_modules/**')
  })

  it('handles whitespace differences', () => {
    const result = removePatternFromContent('  dist/**  ', 'dist/**')

    expect(result.found).toBe(true)
  })

  it('removes only the first occurrence', () => {
    const result = removePatternFromContent('a\na\nb', 'a')

    expect(result.found).toBe(true)
    expect(result.content).toBe('a\nb')
  })
})

// ─── resolveIgnoreOptions ────────────────────────────
describe('resolveIgnoreOptions', () => {
  it('maps args and flags to IgnoreOptions', () => {
    const options = resolveIgnoreOptions(
      { action: 'add', pattern: 'dist/**' },
      { file: '.customignore' },
    )

    expect(options).toEqual<IgnoreOptions>({
      action: 'add',
      file: '.customignore',
      pattern: 'dist/**',
    })
  })

  it('handles missing pattern', () => {
    const options = resolveIgnoreOptions({ action: 'list' }, { file: '.codeforgeignore' })

    expect(options.pattern).toBeUndefined()
  })
})

// ─── formatPatternList ───────────────────────────────
describe('formatPatternList', () => {
  it('lists patterns with file info', () => {
    const logged: string[] = []
    formatPatternList(['node_modules/**', 'dist/**'], '.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('node_modules/**'))).toBe(true)
    expect(logged.some((l) => l.includes('2 patterns'))).toBe(true)
    expect(logged.some((l) => l.includes('.codeforgeignore'))).toBe(true)
  })

  it('shows empty when no patterns', () => {
    const logged: string[] = []
    formatPatternList([], '.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('(empty)'))).toBe(true)
    expect(logged.some((l) => l.includes('0 patterns'))).toBe(true)
  })

  it('shows singular form for single pattern', () => {
    const logged: string[] = []
    formatPatternList(['dist/**'], '.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('1 pattern'))).toBe(true)
    expect(logged.some((l) => l.includes('1 patterns'))).toBe(false)
  })
})

// ─── formatNoFileMessage ─────────────────────────────
describe('formatNoFileMessage', () => {
  it('logs the file path and creation hint', () => {
    const logged: string[] = []
    formatNoFileMessage('.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('.codeforgeignore'))).toBe(true)
    expect(logged.some((l) => l.includes('ignore add'))).toBe(true)
  })
})

// ─── formatAddResult ─────────────────────────────────
describe('formatAddResult', () => {
  it('logs success with pattern and file', () => {
    const logged: string[] = []
    formatAddResult('dist/**', '.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('dist/**'))).toBe(true)
    expect(logged.some((l) => l.includes('Added'))).toBe(true)
  })
})

// ─── formatDuplicateWarning ──────────────────────────
describe('formatDuplicateWarning', () => {
  it('warns about duplicate pattern', () => {
    const logged: string[] = []
    formatDuplicateWarning('dist/**', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('already exists'))).toBe(true)
    expect(logged.some((l) => l.includes('dist/**'))).toBe(true)
  })
})

// ─── formatRemoveResult ──────────────────────────────
describe('formatRemoveResult', () => {
  it('logs removal success with pattern and file', () => {
    const logged: string[] = []
    formatRemoveResult('dist/**', '.codeforgeignore', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('Removed'))).toBe(true)
    expect(logged.some((l) => l.includes('dist/**'))).toBe(true)
  })
})
