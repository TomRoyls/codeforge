import { describe, expect, it } from 'vitest'

import {
  extractPatterns,
  isDuplicatePattern,
  addPatternToContent,
  removePatternFromContent,
  resolveIgnoreOptions,
} from '../../src/commands/ignore-helpers.js'

// ─── extractPatterns ───

describe('extractPatterns', () => {
  it('extracts non-empty, non-comment lines', () => {
    const content = 'node_modules\n# comment\ndist\n\nsrc/**\n'
    expect(extractPatterns(content)).toEqual(['node_modules', 'dist', 'src/**'])
  })

  it('trims whitespace from lines', () => {
    expect(extractPatterns('  foo  \n  bar  ')).toEqual(['foo', 'bar'])
  })

  it('returns empty array for empty content', () => {
    expect(extractPatterns('')).toEqual([])
    expect(extractPatterns('# only comments')).toEqual([])
  })

  it('filters out lines starting with #', () => {
    const content = '# header\npattern1\n# another comment\npattern2'
    expect(extractPatterns(content)).toEqual(['pattern1', 'pattern2'])
  })
})

// ─── isDuplicatePattern ───

describe('isDuplicatePattern', () => {
  it('returns true when pattern exists', () => {
    expect(isDuplicatePattern(['node_modules', 'dist'], 'node_modules')).toBe(true)
  })

  it('returns false when pattern does not exist', () => {
    expect(isDuplicatePattern(['node_modules', 'dist'], 'coverage')).toBe(false)
  })

  it('ignores whitespace differences', () => {
    expect(isDuplicatePattern(['  node_modules  '], 'node_modules')).toBe(true)
  })

  it('returns false for empty lines', () => {
    expect(isDuplicatePattern([], 'anything')).toBe(false)
  })
})

// ─── addPatternToContent ───

describe('addPatternToContent', () => {
  it('appends pattern to existing content', () => {
    expect(addPatternToContent('node_modules', 'dist')).toBe('node_modules\ndist')
  })

  it('returns just the pattern for empty content', () => {
    expect(addPatternToContent('', 'node_modules')).toBe('node_modules')
  })

  it('handles whitespace-only content as empty', () => {
    expect(addPatternToContent('   ', 'pattern')).toBe('pattern')
  })
})

// ─── removePatternFromContent ───

describe('removePatternFromContent', () => {
  it('removes pattern and returns found=true', () => {
    const result = removePatternFromContent('node_modules\ndist', 'dist')
    expect(result.found).toBe(true)
    expect(result.content).toBe('node_modules')
  })

  it('returns found=false when pattern not present', () => {
    const result = removePatternFromContent('node_modules', 'coverage')
    expect(result.found).toBe(false)
    expect(result.content).toBe('node_modules')
  })

  it('handles pattern with whitespace', () => {
    const result = removePatternFromContent('node_modules\n  dist  ', 'dist')
    expect(result.found).toBe(true)
  })

  it('removes only first occurrence', () => {
    const result = removePatternFromContent('dist\nfoo\ndist', 'dist')
    const lines = result.content.split('\n')
    expect(lines.filter((l) => l === 'dist')).toHaveLength(1)
  })
})

// ─── resolveIgnoreOptions ───

describe('resolveIgnoreOptions', () => {
  it('resolves options from args and flags', () => {
    const result = resolveIgnoreOptions(
      { action: 'add', pattern: 'node_modules' },
      { file: '.gitignore' },
    )
    expect(result.action).toBe('add')
    expect(result.pattern).toBe('node_modules')
    expect(result.file).toBe('.gitignore')
  })

  it('handles missing pattern', () => {
    const result = resolveIgnoreOptions({ action: 'list' }, { file: '.codeforgeignore' })
    expect(result.pattern).toBeUndefined()
  })
})
