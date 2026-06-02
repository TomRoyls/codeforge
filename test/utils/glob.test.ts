import { describe, expect, it } from 'vitest'
import { globToRegex, matchGlob, matchAnyGlob } from '../../src/utils/glob.js'

// ─── globToRegex ───

describe('globToRegex', () => {
  it('matches exact string', () => {
    const re = globToRegex('hello')
    expect(re.test('hello')).toBe(true)
    expect(re.test('hell')).toBe(false)
    expect(re.test('helloo')).toBe(false)
  })

  it('matches single wildcard *', () => {
    const re = globToRegex('*.ts')
    expect(re.test('foo.ts')).toBe(true)
    expect(re.test('bar.ts')).toBe(true)
    expect(re.test('foo/bar.ts')).toBe(false)
    expect(re.test('foo.tsx')).toBe(false)
  })

  it('matches double wildcard **', () => {
    const re = globToRegex('**/*.ts')
    expect(re.test('foo.ts')).toBe(true)
    expect(re.test('bar/foo.ts')).toBe(true)
    expect(re.test('a/b/c/foo.ts')).toBe(true)
    expect(re.test('foo.js')).toBe(false)
  })

  it('matches double wildcard without slash', () => {
    const re = globToRegex('a**b')
    expect(re.test('ab')).toBe(true)
    expect(re.test('axb')).toBe(true)
    expect(re.test('axyzb')).toBe(true)
  })

  it('matches ? single char', () => {
    const re = globToRegex('file?.ts')
    expect(re.test('file1.ts')).toBe(true)
    expect(re.test('fileA.ts')).toBe(true)
    expect(re.test('file.ts')).toBe(false)
    expect(re.test('file12.ts')).toBe(false)
  })

  it('matches character class', () => {
    const re = globToRegex('file.[jt]s')
    expect(re.test('file.js')).toBe(true)
    expect(re.test('file.ts')).toBe(true)
    expect(re.test('file.cs')).toBe(false)
  })

  it('matches negated character class', () => {
    const re = globToRegex('file.[!jt]s')
    expect(re.test('file.js')).toBe(false)
    expect(re.test('file.ts')).toBe(false)
    expect(re.test('file.cs')).toBe(true)
  })

  it('handles ignoreCase option', () => {
    const re = globToRegex('*.TS', { ignoreCase: true })
    expect(re.test('foo.ts')).toBe(true)
    expect(re.test('foo.TS')).toBe(true)
  })
})

// ─── matchGlob ───

describe('matchGlob', () => {
  it('matches correctly', () => {
    expect(matchGlob('test.ts', '*.ts')).toBe(true)
    expect(matchGlob('test.js', '*.ts')).toBe(false)
  })

  it('matches complex patterns', () => {
    expect(matchGlob('src/utils/helper.ts', 'src/**/*.ts')).toBe(true)
    expect(matchGlob('src/utils/helper.js', 'src/**/*.ts')).toBe(false)
  })
})

// ─── matchAnyGlob ───

describe('matchAnyGlob', () => {
  it('matches any pattern', () => {
    expect(matchAnyGlob('test.ts', ['*.js', '*.ts'])).toBe(true)
    expect(matchAnyGlob('test.py', ['*.js', '*.ts'])).toBe(false)
  })

  it('returns false for empty patterns', () => {
    expect(matchAnyGlob('test.ts', [])).toBe(false)
  })
})

describe('globToRegex edge cases', () => {
  it('matches empty string pattern', () => {
    const re = globToRegex('')
    expect(re.test('')).toBe(true)
    expect(re.test('a')).toBe(false)
  })

  it('handles special regex characters in pattern', () => {
    const re = globToRegex('file.(test).ts')
    expect(re.test('file.(test).ts')).toBe(true)
  })

  it('matches multiple * wildcards', () => {
    const re = globToRegex('*/*.ts')
    expect(re.test('src/foo.ts')).toBe(true)
    expect(re.test('src/bar/foo.ts')).toBe(false)
  })

  it('handles ? at start', () => {
    const re = globToRegex('?ello')
    expect(re.test('hello')).toBe(true)
    expect(re.test('ello')).toBe(false)
  })

  it('character class with range', () => {
    const re = globToRegex('file[0-9].ts')
    expect(re.test('file3.ts')).toBe(true)
    expect(re.test('fileA.ts')).toBe(false)
  })
})

describe('matchGlob edge cases', () => {
  it('exact string match', () => {
    expect(matchGlob('exact', 'exact')).toBe(true)
    expect(matchGlob('exact', 'other')).toBe(false)
  })

  it('wildcard matches empty segment', () => {
    expect(matchGlob('file.ts', 'file*.ts')).toBe(true)
  })

  it('star matches multiple characters', () => {
    expect(matchGlob('foobarbaz', 'foo*baz')).toBe(true)
  })
})
