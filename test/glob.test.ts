import { describe, expect, it } from 'vitest'

import { globToRegex, matchAnyGlob, matchGlob } from '../src/utils/glob.js'

// ─── globToRegex ──────────────────────────────────────
describe('globToRegex', () => {
  it('matches exact string', () => {
    expect(globToRegex('file.txt').test('file.txt')).toBe(true)
    expect(globToRegex('file.txt').test('other.txt')).toBe(false)
  })

  it('matches single wildcard *', () => {
    const re = globToRegex('*.ts')
    expect(re.test('index.ts')).toBe(true)
    expect(re.test('src/main.ts')).toBe(false)
  })

  it('matches double wildcard **', () => {
    const re = globToRegex('**/*.ts')
    expect(re.test('index.ts')).toBe(true)
    expect(re.test('src/main.ts')).toBe(true)
    expect(re.test('src/deep/file.ts')).toBe(true)
  })

  it('matches ? as single char', () => {
    const re = globToRegex('file?.txt')
    expect(re.test('file1.txt')).toBe(true)
    expect(re.test('file12.txt')).toBe(false)
  })

  it('matches character class', () => {
    const re = globToRegex('file.[jt]s')
    expect(re.test('file.js')).toBe(true)
    expect(re.test('file.ts')).toBe(true)
    expect(re.test('file.rs')).toBe(false)
  })

  it('handles escape characters', () => {
    const re = globToRegex('file\\.txt')
    expect(re.test('file.txt')).toBe(true)
  })

  it('supports ignoreCase option', () => {
    const re = globToRegex('FILE.TXT', { ignoreCase: true })
    expect(re.test('file.txt')).toBe(true)
  })
})

// ─── matchGlob ────────────────────────────────────────
describe('matchGlob', () => {
  it('matches basic pattern', () => {
    expect(matchGlob('test.ts', '*.ts')).toBe(true)
    expect(matchGlob('test.js', '*.ts')).toBe(false)
  })

  it('matches nested paths', () => {
    expect(matchGlob('src/utils/helpers.ts', 'src/**/*.ts')).toBe(true)
  })

  it('matches with double star prefix', () => {
    expect(matchGlob('deep/nested/file.ts', '**/*.ts')).toBe(true)
  })
})

// ─── matchAnyGlob ─────────────────────────────────────
describe('matchAnyGlob', () => {
  const patterns = ['*.ts', '*.js', '*.json']

  it('matches any of the patterns', () => {
    expect(matchAnyGlob('file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('file.js', patterns)).toBe(true)
    expect(matchAnyGlob('file.py', patterns)).toBe(false)
  })

  it('returns false for empty patterns', () => {
    expect(matchAnyGlob('file.ts', [])).toBe(false)
  })
})
