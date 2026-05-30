import { describe, test, expect } from 'vitest'
import { globToRegex, matchGlob, matchAnyGlob } from '../../../src/utils/glob.js'

describe('globToRegex', () => {
  test('returns regex for simple wildcard *.ts', () => {
    const regex = globToRegex('*.ts')
    expect(regex.test('file.ts')).toBe(true)
    expect(regex.test('test.ts')).toBe(true)
    expect(regex.test('src.ts')).toBe(true)
  })

  test('returns regex for simple wildcard foo.*', () => {
    const regex = globToRegex('foo.*')
    expect(regex.test('foo.ts')).toBe(true)
    expect(regex.test('foo.js')).toBe(true)
    expect(regex.test('foo.txt')).toBe(true)
    expect(regex.test('bar.ts')).toBe(false)
  })

  test('returns regex for double wildcard **/*.ts', () => {
    const regex = globToRegex('**/*.ts')
    expect(regex.test('file.ts')).toBe(true)
    expect(regex.test('src/file.ts')).toBe(true)
    expect(regex.test('src/nested/file.ts')).toBe(true)
    expect(regex.test('deep/path/to/file.ts')).toBe(true)
  })

  test('returns regex for double wildcard **/test/**', () => {
    const regex = globToRegex('**/test/**')
    expect(regex.test('test/file.ts')).toBe(true)
    expect(regex.test('src/test/file.ts')).toBe(true)
    expect(regex.test('src/nested/test/file.ts')).toBe(true)
    expect(regex.test('test/nested/file.ts')).toBe(true)
  })

  test('returns regex for double wildcard src/**', () => {
    const regex = globToRegex('src/**')
    expect(regex.test('src/')).toBe(true)
    expect(regex.test('src/file.ts')).toBe(true)
    expect(regex.test('src/nested/file.ts')).toBe(true)
    expect(regex.test('src/deep/path/to/file.ts')).toBe(true)
    expect(regex.test('file.ts')).toBe(false)
  })

  test('returns regex for question mark file?.ts', () => {
    const regex = globToRegex('file?.ts')
    expect(regex.test('filea.ts')).toBe(true)
    expect(regex.test('fileb.ts')).toBe(true)
    expect(regex.test('file1.ts')).toBe(true)
    expect(regex.test('file.ts')).toBe(false)
    expect(regex.test('file12.ts')).toBe(false)
  })

  test('returns regex for question mark in multiple positions', () => {
    const regex = globToRegex('???.ts')
    expect(regex.test('abc.ts')).toBe(true)
    expect(regex.test('123.ts')).toBe(true)
    expect(regex.test('ab.ts')).toBe(false)
    expect(regex.test('abcd.ts')).toBe(false)
  })

  test('returns regex for character class [abc]', () => {
    const regex = globToRegex('file[abc].ts')
    expect(regex.test('filea.ts')).toBe(true)
    expect(regex.test('fileb.ts')).toBe(true)
    expect(regex.test('filec.ts')).toBe(true)
    expect(regex.test('filed.ts')).toBe(false)
    expect(regex.test('file.ts')).toBe(false)
  })

  test('returns regex for negated character class [!abc]', () => {
    const regex = globToRegex('file[!abc].ts')
    expect(regex.test('filed.ts')).toBe(true)
    expect(regex.test('file1.ts')).toBe(true)
    expect(regex.test('filex.ts')).toBe(true)
    expect(regex.test('filea.ts')).toBe(false)
    expect(regex.test('fileb.ts')).toBe(false)
    expect(regex.test('filec.ts')).toBe(false)
  })

  test('returns regex for escaped wildcard \\*', () => {
    const regex = globToRegex('file\\*.ts')
    expect(regex.test('file*.ts')).toBe(true)
    expect(regex.test('filea.ts')).toBe(false)
    expect(regex.test('file.ts')).toBe(false)
  })

  test('returns regex for escaped question mark \\?', () => {
    const regex = globToRegex('file\\?.ts')
    expect(regex.test('file?.ts')).toBe(true)
    expect(regex.test('filea.ts')).toBe(false)
    expect(regex.test('file.ts')).toBe(false)
  })

  test('returns regex for escaped backslash \\\\', () => {
    const regex = globToRegex('file\\\\.ts')
    expect(regex.test('file\\.ts')).toBe(true)
  })

  test('returns regex with case-insensitive flag', () => {
    const regex = globToRegex('FILE.TS', { ignoreCase: true })
    expect(regex.test('file.ts')).toBe(true)
    expect(regex.test('FILE.TS')).toBe(true)
    expect(regex.test('File.Ts')).toBe(true)
  })

  test('returns regex without case-insensitive flag by default', () => {
    const regex = globToRegex('FILE.TS')
    expect(regex.test('file.ts')).toBe(false)
    expect(regex.test('FILE.TS')).toBe(true)
  })

  test('returns regex for empty string pattern', () => {
    const regex = globToRegex('')
    expect(regex.test('')).toBe(true)
    expect(regex.test('file.ts')).toBe(false)
  })

  test('returns regex for literal match without wildcards', () => {
    const regex = globToRegex('file.ts')
    expect(regex.test('file.ts')).toBe(true)
    expect(regex.test('File.ts')).toBe(false)
    expect(regex.test('file.js')).toBe(false)
    expect(regex.test('src/file.ts')).toBe(false)
  })

  test('returns regex for pattern with slash', () => {
    const regex = globToRegex('src/file.ts')
    expect(regex.test('src/file.ts')).toBe(true)
    expect(regex.test('file.ts')).toBe(false)
    expect(regex.test('src/nested/file.ts')).toBe(false)
  })

  test('returns same regex for same pattern and options', () => {
    const regex1 = globToRegex('*.ts')
    const regex2 = globToRegex('*.ts')
    expect(regex1).toBe(regex2)
  })

  test('returns same regex for same pattern with ignoreCase option', () => {
    const regex1 = globToRegex('*.ts', { ignoreCase: true })
    const regex2 = globToRegex('*.ts', { ignoreCase: true })
    expect(regex1).toBe(regex2)
  })

  test('returns different regex for different ignoreCase options', () => {
    const regex1 = globToRegex('*.ts', { ignoreCase: false })
    const regex2 = globToRegex('*.ts', { ignoreCase: true })
    expect(regex1).not.toBe(regex2)
  })

  test('returns regex for pattern with multiple wildcards', () => {
    const regex = globToRegex('src/**/*.test.ts')
    expect(regex.test('src/file.test.ts')).toBe(true)
    expect(regex.test('src/nested/file.test.ts')).toBe(true)
    expect(regex.test('src/deep/nested/file.test.ts')).toBe(true)
    expect(regex.test('src/file.ts')).toBe(false)
  })

  test('returns regex for pattern with special characters', () => {
    const regex = globToRegex('file[abc]?.ts')
    expect(regex.test('fileaa.ts')).toBe(true)
    expect(regex.test('fileba.ts')).toBe(true)
    expect(regex.test('fileca.ts')).toBe(true)
  })
})

describe('matchGlob', () => {
  test('matches simple wildcard *.ts', () => {
    expect(matchGlob('file.ts', '*.ts')).toBe(true)
    expect(matchGlob('test.ts', '*.ts')).toBe(true)
    expect(matchGlob('file.js', '*.ts')).toBe(false)
  })

  test('matches simple wildcard foo.*', () => {
    expect(matchGlob('foo.ts', 'foo.*')).toBe(true)
    expect(matchGlob('foo.js', 'foo.*')).toBe(true)
    expect(matchGlob('bar.ts', 'foo.*')).toBe(false)
  })

  test('matches double wildcard **/*.ts', () => {
    expect(matchGlob('file.ts', '**/*.ts')).toBe(true)
    expect(matchGlob('src/file.ts', '**/*.ts')).toBe(true)
    expect(matchGlob('src/nested/file.ts', '**/*.ts')).toBe(true)
    expect(matchGlob('file.js', '**/*.ts')).toBe(false)
  })

  test('matches double wildcard **/test/**', () => {
    expect(matchGlob('test/file.ts', '**/test/**')).toBe(true)
    expect(matchGlob('src/test/file.ts', '**/test/**')).toBe(true)
    expect(matchGlob('src/nested/test/file.ts', '**/test/**')).toBe(true)
    expect(matchGlob('src/file.ts', '**/test/**')).toBe(false)
  })

  test('matches double wildcard src/**', () => {
    expect(matchGlob('src/', 'src/**')).toBe(true)
    expect(matchGlob('src/file.ts', 'src/**')).toBe(true)
    expect(matchGlob('src/nested/file.ts', 'src/**')).toBe(true)
    expect(matchGlob('file.ts', 'src/**')).toBe(false)
  })

  test('matches question mark file?.ts', () => {
    expect(matchGlob('filea.ts', 'file?.ts')).toBe(true)
    expect(matchGlob('fileb.ts', 'file?.ts')).toBe(true)
    expect(matchGlob('file.ts', 'file?.ts')).toBe(false)
  })

  test('matches character class [abc]', () => {
    expect(matchGlob('filea.ts', 'file[abc].ts')).toBe(true)
    expect(matchGlob('fileb.ts', 'file[abc].ts')).toBe(true)
    expect(matchGlob('filec.ts', 'file[abc].ts')).toBe(true)
    expect(matchGlob('filed.ts', 'file[abc].ts')).toBe(false)
  })

  test('matches negated character class [!abc]', () => {
    expect(matchGlob('filed.ts', 'file[!abc].ts')).toBe(true)
    expect(matchGlob('filea.ts', 'file[!abc].ts')).toBe(false)
    expect(matchGlob('fileb.ts', 'file[!abc].ts')).toBe(false)
  })

  test('matches escaped wildcard \\*', () => {
    expect(matchGlob('file*.ts', 'file\\*.ts')).toBe(true)
    expect(matchGlob('filea.ts', 'file\\*.ts')).toBe(false)
  })

  test('matches escaped question mark \\?', () => {
    expect(matchGlob('file?.ts', 'file\\?.ts')).toBe(true)
    expect(matchGlob('filea.ts', 'file\\?.ts')).toBe(false)
  })

  test('matches with case-insensitive option', () => {
    expect(matchGlob('file.ts', 'FILE.TS', { ignoreCase: true })).toBe(true)
    expect(matchGlob('FILE.TS', 'file.ts', { ignoreCase: true })).toBe(true)
    expect(matchGlob('File.Ts', 'FILE.TS', { ignoreCase: true })).toBe(true)
  })

  test('does not match with different case without ignoreCase option', () => {
    expect(matchGlob('file.ts', 'FILE.TS')).toBe(false)
    expect(matchGlob('FILE.TS', 'file.ts')).toBe(false)
  })

  test('matches empty string pattern', () => {
    expect(matchGlob('', '')).toBe(true)
    expect(matchGlob('file.ts', '')).toBe(false)
  })

  test('matches literal pattern without wildcards', () => {
    expect(matchGlob('file.ts', 'file.ts')).toBe(true)
    expect(matchGlob('File.ts', 'file.ts')).toBe(false)
    expect(matchGlob('file.js', 'file.ts')).toBe(false)
  })

  test('matches pattern with slash', () => {
    expect(matchGlob('src/file.ts', 'src/file.ts')).toBe(true)
    expect(matchGlob('file.ts', 'src/file.ts')).toBe(false)
    expect(matchGlob('src/nested/file.ts', 'src/file.ts')).toBe(false)
  })

  test('matches pattern with multiple wildcards', () => {
    expect(matchGlob('src/file.test.ts', 'src/**/*.test.ts')).toBe(true)
    expect(matchGlob('src/nested/file.test.ts', 'src/**/*.test.ts')).toBe(true)
    expect(matchGlob('src/file.ts', 'src/**/*.test.ts')).toBe(false)
  })

  test('matches complex pattern', () => {
    expect(matchGlob('src/components/Button.test.ts', 'src/**/[A-Z]*.test.ts')).toBe(true)
    expect(matchGlob('src/components/button.test.ts', 'src/**/[A-Z]*.test.ts')).toBe(false)
  })
})

describe('matchAnyGlob', () => {
  test('returns true when any pattern matches', () => {
    const patterns = ['*.ts', '*.js', '*.json']
    expect(matchAnyGlob('file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('file.js', patterns)).toBe(true)
    expect(matchAnyGlob('file.json', patterns)).toBe(true)
  })

  test('returns false when no pattern matches', () => {
    const patterns = ['*.ts', '*.js', '*.json']
    expect(matchAnyGlob('file.txt', patterns)).toBe(false)
    expect(matchAnyGlob('file.md', patterns)).toBe(false)
  })

  test('returns true with single matching pattern', () => {
    const patterns = ['*.ts']
    expect(matchAnyGlob('file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('file.js', patterns)).toBe(false)
  })

  test('returns false with single non-matching pattern', () => {
    const patterns = ['*.ts']
    expect(matchAnyGlob('file.js', patterns)).toBe(false)
  })

  test('returns false with empty patterns array', () => {
    expect(matchAnyGlob('file.ts', [])).toBe(false)
  })

  test('returns true with multiple patterns some matching', () => {
    const patterns = ['*.ts', '*.js', '*.md', '*.json']
    expect(matchAnyGlob('file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('readme.md', patterns)).toBe(true)
    expect(matchAnyGlob('file.txt', patterns)).toBe(false)
  })

  test('respects ignoreCase option', () => {
    const patterns = ['FILE.TS', '*.JS']
    expect(matchAnyGlob('file.ts', patterns, { ignoreCase: true })).toBe(true)
    expect(matchAnyGlob('test.js', patterns, { ignoreCase: true })).toBe(true)
    expect(matchAnyGlob('file.ts', patterns, { ignoreCase: false })).toBe(false)
  })

  test('works with complex patterns', () => {
    const patterns = ['src/**/*.ts', 'test/**/*.test.ts', '**/*.spec.ts']
    expect(matchAnyGlob('src/components/Button.ts', patterns)).toBe(true)
    expect(matchAnyGlob('test/utils.test.ts', patterns)).toBe(true)
    expect(matchAnyGlob('src/utils.spec.ts', patterns)).toBe(true)
    expect(matchAnyGlob('src/utils.ts', patterns)).toBe(true)
    expect(matchAnyGlob('docs/api.md', patterns)).toBe(false)
  })

  test('handles patterns with slashes', () => {
    const patterns = ['src/file.ts', 'test/file.ts']
    expect(matchAnyGlob('src/file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('test/file.ts', patterns)).toBe(true)
    expect(matchAnyGlob('src/nested/file.ts', patterns)).toBe(false)
  })

  test('handles escaped patterns', () => {
    const patterns = ['file\\*.ts', 'file\\?.ts']
    expect(matchAnyGlob('file*.ts', patterns)).toBe(true)
    expect(matchAnyGlob('file?.ts', patterns)).toBe(true)
    expect(matchAnyGlob('filea.ts', patterns)).toBe(false)
  })
})