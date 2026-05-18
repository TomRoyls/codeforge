import { describe, it, expect } from 'vitest'
import { CodeSearch } from '../src/core/code-search/code-search.js'
import {
  DEFAULT_SEARCH_QUERY,
  DEFAULT_REPLACE_OPTIONS,
} from '../src/core/code-search/types.js'
import type {
  SearchQuery,
  SearchMatch,
  ReplaceOptions,
} from '../src/core/code-search/types.js'

// ─── Defaults ──────────────────────────────────────────────────────
describe('DEFAULT_SEARCH_QUERY', () => {
  it('has correct default values', () => {
    expect(DEFAULT_SEARCH_QUERY).toEqual({
      pattern: '',
      isRegex: false,
      caseSensitive: false,
      wholeWord: false,
      maxResults: 1000,
    })
  })
})

describe('DEFAULT_REPLACE_OPTIONS', () => {
  it('has correct default values', () => {
    expect(DEFAULT_REPLACE_OPTIONS).toEqual({
      replacement: '',
      all: false,
    })
  })
})

// ─── Constructor ───────────────────────────────────────────────────
describe('CodeSearch constructor', () => {
  it('starts with no files', () => {
    const cs = new CodeSearch()
    expect(cs.getFiles()).toEqual([])
  })

  it('starts with no index', () => {
    const cs = new CodeSearch()
    expect(cs.getIndex()).toBeNull()
  })

  it('starts with zero statistics', () => {
    const cs = new CodeSearch()
    const stats = cs.getStatistics()
    expect(stats.totalFiles).toBe(0)
    expect(stats.totalLines).toBe(0)
    expect(stats.indexSize).toBeNull()
    expect(stats.lastSearchDuration).toBe(0)
  })
})

// ─── addFile ───────────────────────────────────────────────────────
describe('addFile', () => {
  it('adds a file and returns true', () => {
    const cs = new CodeSearch()
    expect(cs.addFile('a.ts', 'hello')).toBe(true)
    expect(cs.hasFile('a.ts')).toBe(true)
  })

  it('returns false for duplicate path', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'first')
    expect(cs.addFile('a.ts', 'second')).toBe(false)
    expect(cs.getFile('a.ts')).toBe('first')
  })

  it('adds multiple different files', () => {
    const cs = new CodeSearch()
    expect(cs.addFile('a.ts', 'aaa')).toBe(true)
    expect(cs.addFile('b.ts', 'bbb')).toBe(true)
    expect(cs.getFiles()).toHaveLength(2)
  })

  it('invalidates existing index', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'content')
    cs.buildIndex()
    expect(cs.getIndex()).not.toBeNull()
    cs.addFile('b.ts', 'more')
    expect(cs.getIndex()).toBeNull()
  })

  it('stores empty content', () => {
    const cs = new CodeSearch()
    expect(cs.addFile('empty.ts', '')).toBe(true)
    expect(cs.getFile('empty.ts')).toBe('')
  })

  it('stores multi-line content', () => {
    const cs = new CodeSearch()
    cs.addFile('multi.ts', 'line1\nline2\nline3')
    expect(cs.getFile('multi.ts')).toBe('line1\nline2\nline3')
  })
})

// ─── removeFile ────────────────────────────────────────────────────
describe('removeFile', () => {
  it('removes an existing file and returns true', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    expect(cs.removeFile('a.ts')).toBe(true)
    expect(cs.hasFile('a.ts')).toBe(false)
  })

  it('returns false for non-existing file', () => {
    const cs = new CodeSearch()
    expect(cs.removeFile('nope.ts')).toBe(false)
  })

  it('removes only the specified file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'aaa')
    cs.addFile('b.ts', 'bbb')
    cs.removeFile('a.ts')
    expect(cs.hasFile('a.ts')).toBe(false)
    expect(cs.hasFile('b.ts')).toBe(true)
  })

  it('invalidates existing index', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'content')
    cs.buildIndex()
    cs.removeFile('a.ts')
    expect(cs.getIndex()).toBeNull()
  })

  it('allows re-adding a removed file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'first')
    cs.removeFile('a.ts')
    expect(cs.addFile('a.ts', 'second')).toBe(true)
    expect(cs.getFile('a.ts')).toBe('second')
  })
})

// ─── getFile ───────────────────────────────────────────────────────
describe('getFile', () => {
  it('returns content for existing file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    expect(cs.getFile('a.ts')).toBe('hello world')
  })

  it('returns undefined for non-existing file', () => {
    const cs = new CodeSearch()
    expect(cs.getFile('missing.ts')).toBeUndefined()
  })
})

// ─── getFiles ──────────────────────────────────────────────────────
describe('getFiles', () => {
  it('returns empty array when no files', () => {
    const cs = new CodeSearch()
    expect(cs.getFiles()).toEqual([])
  })

  it('returns all file paths', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'a')
    cs.addFile('b.ts', 'b')
    cs.addFile('c.ts', 'c')
    const files = cs.getFiles()
    expect(files).toContain('a.ts')
    expect(files).toContain('b.ts')
    expect(files).toContain('c.ts')
    expect(files).toHaveLength(3)
  })
})

// ─── hasFile ───────────────────────────────────────────────────────
describe('hasFile', () => {
  it('returns true for existing file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    expect(cs.hasFile('a.ts')).toBe(true)
  })

  it('returns false for non-existing file', () => {
    const cs = new CodeSearch()
    expect(cs.hasFile('nope.ts')).toBe(false)
  })

  it('returns false after file is removed', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.removeFile('a.ts')
    expect(cs.hasFile('a.ts')).toBe(false)
  })
})

// ─── search ────────────────────────────────────────────────────────
describe('search', () => {
  it('finds a simple string match', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('hello')
  })

  it('is case-insensitive by default', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'Hello HELLO')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.totalMatches).toBe(2)
  })

  it('respects caseSensitive flag', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'Hello hello')
    const result = cs.search({
      pattern: 'hello',
      caseSensitive: true,
    } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('hello')
  })

  it('supports regex patterns', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'abc123def')
    const result = cs.search({ pattern: '\\d+', isRegex: true } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('123')
  })

  it('supports wholeWord flag', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foobar foo barfoo')
    const result = cs.search({ pattern: 'foo', wholeWord: true } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('foo')
    expect(result.matches[0]!.columnStart).toBe(7)
  })

  it('respects maxResults', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'aaa bbb aaa ccc aaa')
    const result = cs.search({ pattern: 'aaa', maxResults: 2 } as SearchQuery)
    expect(result.totalMatches).toBe(2)
  })

  it('filters by filePattern', () => {
    const cs = new CodeSearch()
    cs.addFile('src/a.ts', 'hello')
    cs.addFile('src/b.js', 'hello')
    const result = cs.search({
      pattern: 'hello',
      filePattern: '*.ts',
    } as SearchQuery)
    expect(result.filesWithMatches).toBe(1)
    expect(result.matches[0]!.filePath).toBe('src/a.ts')
  })

  it('returns correct search metadata', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.addFile('b.ts', 'world')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.filesSearched).toBe(2)
    expect(result.filesWithMatches).toBe(1)
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(result.query.pattern).toBe('hello')
  })

  it('returns empty matches for empty pattern', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    const result = cs.search({ pattern: '' } as SearchQuery)
    expect(result.totalMatches).toBe(0)
  })

  it('returns empty matches when no files added', () => {
    const cs = new CodeSearch()
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.totalMatches).toBe(0)
    expect(result.filesSearched).toBe(0)
  })

  it('finds matches across multiple files', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.addFile('b.ts', 'hello world')
    cs.addFile('c.ts', 'no match')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.totalMatches).toBe(2)
    expect(result.filesWithMatches).toBe(2)
  })

  it('finds multiple matches on same line', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'ab ab ab')
    const result = cs.search({ pattern: 'ab' } as SearchQuery)
    expect(result.totalMatches).toBe(3)
  })

  it('finds matches on different lines', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello\nworld\nhello')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    expect(result.totalMatches).toBe(2)
    expect(result.matches[0]!.lineNumber).toBe(1)
    expect(result.matches[1]!.lineNumber).toBe(3)
  })

  it('search result includes full query defaults', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'test')
    const result = cs.search({ pattern: 'test' } as SearchQuery)
    expect(result.query.isRegex).toBe(false)
    expect(result.query.caseSensitive).toBe(false)
    expect(result.query.wholeWord).toBe(false)
    expect(result.query.maxResults).toBe(1000)
  })

  it('matches on match object include correct columns', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'abc hello def')
    const result = cs.search({ pattern: 'hello' } as SearchQuery)
    const m = result.matches[0]!
    expect(m.columnStart).toBe(4)
    expect(m.columnEnd).toBe(9)
    expect(m.line).toBe('abc hello def')
  })

  it('filePattern with wildcard matches subdirectories', () => {
    const cs = new CodeSearch()
    cs.addFile('src/utils/a.ts', 'test')
    cs.addFile('src/b.ts', 'test')
    cs.addFile('test/c.ts', 'test')
    const result = cs.search({
      pattern: 'test',
      filePattern: 'src/**',
    } as SearchQuery)
    expect(result.filesWithMatches).toBe(2)
  })
})

// ─── searchFile ────────────────────────────────────────────────────
describe('searchFile', () => {
  it('returns matches for a specific file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    const matches = cs.searchFile('a.ts', { pattern: 'hello' } as SearchQuery)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.filePath).toBe('a.ts')
  })

  it('returns empty array for non-existing file', () => {
    const cs = new CodeSearch()
    const matches = cs.searchFile('missing.ts', { pattern: 'hello' } as SearchQuery)
    expect(matches).toEqual([])
  })

  it('returns empty array for empty pattern', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    const matches = cs.searchFile('a.ts', { pattern: '' } as SearchQuery)
    expect(matches).toEqual([])
  })

  it('respects regex in searchFile', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo123bar')
    const matches = cs.searchFile('a.ts', {
      pattern: '[0-9]+',
      isRegex: true,
    } as SearchQuery)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.match).toBe('123')
  })

  it('respects caseSensitive in searchFile', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'Hello hello HELLO')
    const ci = cs.searchFile('a.ts', { pattern: 'hello' } as SearchQuery)
    expect(ci).toHaveLength(3)
    const cs2 = cs.searchFile('a.ts', {
      pattern: 'hello',
      caseSensitive: true,
    } as SearchQuery)
    expect(cs2).toHaveLength(1)
  })

  it('respects wholeWord in searchFile', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo foobar foo')
    const matches = cs.searchFile('a.ts', {
      pattern: 'foo',
      wholeWord: true,
    } as SearchQuery)
    expect(matches).toHaveLength(2)
  })

  it('respects maxResults in searchFile', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'a a a a a')
    const matches = cs.searchFile('a.ts', {
      pattern: 'a',
      maxResults: 3,
    } as SearchQuery)
    expect(matches).toHaveLength(3)
  })
})

// ─── searchLine ────────────────────────────────────────────────────
describe('searchLine', () => {
  it('finds match in a line', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('hello world', { pattern: 'hello' } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.match).toBe('hello')
    expect(result!.columnStart).toBe(0)
    expect(result!.columnEnd).toBe(5)
  })

  it('returns null when no match', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('hello world', { pattern: 'xyz' } as SearchQuery)
    expect(result).toBeNull()
  })

  it('returns null for empty pattern', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('hello', { pattern: '' } as SearchQuery)
    expect(result).toBeNull()
  })

  it('supports regex', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('abc 123 def', {
      pattern: '\\d+',
      isRegex: true,
    } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.match).toBe('123')
  })

  it('supports caseSensitive', () => {
    const cs = new CodeSearch()
    const ci = cs.searchLine('Hello', { pattern: 'hello' } as SearchQuery)
    expect(ci).not.toBeNull()
    const cs2 = cs.searchLine('Hello', {
      pattern: 'hello',
      caseSensitive: true,
    } as SearchQuery)
    expect(cs2).toBeNull()
  })

  it('supports wholeWord', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('foobar foo barfoo', {
      pattern: 'foo',
      wholeWord: true,
    } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.columnStart).toBe(7)
    expect(result!.match).toBe('foo')
  })

  it('escapes special regex characters in literal mode', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('a+b*c?d', {
      pattern: 'a+b*c?d',
    } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.match).toBe('a+b*c?d')
  })

  it('returns first match only', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('ab ab ab', { pattern: 'ab' } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.columnStart).toBe(0)
  })
})

// ─── buildIndex ────────────────────────────────────────────────────
describe('buildIndex', () => {
  it('builds an index from files', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2')
    cs.addFile('b.ts', 'single')
    const index = cs.buildIndex()
    expect(index.files).toBeInstanceOf(Map)
    expect(index.files.size).toBe(2)
    expect(index.files.get('a.ts')).toEqual(['line1', 'line2'])
    expect(index.files.get('b.ts')).toEqual(['single'])
  })

  it('sets builtAt timestamp', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    const before = Date.now()
    const index = cs.buildIndex()
    const after = Date.now()
    expect(index.builtAt).toBeGreaterThanOrEqual(before)
    expect(index.builtAt).toBeLessThanOrEqual(after)
  })

  it('splits content by newlines', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'a\nb\nc\nd')
    const index = cs.buildIndex()
    expect(index.files.get('a.ts')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('handles empty file content', () => {
    const cs = new CodeSearch()
    cs.addFile('empty.ts', '')
    const index = cs.buildIndex()
    expect(index.files.get('empty.ts')).toEqual([''])
  })

  it('updates getIndex after build', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    expect(cs.getIndex()).toBeNull()
    cs.buildIndex()
    expect(cs.getIndex()).not.toBeNull()
  })
})

// ─── getIndex ──────────────────────────────────────────────────────
describe('getIndex', () => {
  it('returns null before buildIndex', () => {
    const cs = new CodeSearch()
    expect(cs.getIndex()).toBeNull()
  })

  it('returns index after buildIndex', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.buildIndex()
    const index = cs.getIndex()
    expect(index).not.toBeNull()
    expect(index!.files.size).toBe(1)
  })

  it('returns null after file modification', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.buildIndex()
    cs.addFile('b.ts', 'y')
    expect(cs.getIndex()).toBeNull()
  })
})

// ─── replace ───────────────────────────────────────────────────────
describe('replace', () => {
  it('replaces first occurrence by default', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'aaa bbb aaa')
    const result = cs.replace(
      'a.ts',
      { pattern: 'aaa' } as SearchQuery,
      { replacement: 'ccc', all: false } as ReplaceOptions,
    )
    expect(result.replacements).toBe(1)
    expect(result.modified).toBe('ccc bbb aaa')
    expect(result.original).toBe('aaa bbb aaa')
  })

  it('replaces all occurrences when all is true', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'aaa bbb aaa')
    const result = cs.replace(
      'a.ts',
      { pattern: 'aaa' } as SearchQuery,
      { replacement: 'ccc', all: true } as ReplaceOptions,
    )
    expect(result.replacements).toBe(2)
    expect(result.modified).toBe('ccc bbb ccc')
  })

  it('returns zero replacements for non-matching pattern', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    const result = cs.replace(
      'a.ts',
      { pattern: 'xyz' } as SearchQuery,
      { replacement: 'abc', all: false } as ReplaceOptions,
    )
    expect(result.replacements).toBe(0)
    expect(result.modified).toBe('hello')
  })

  it('returns empty result for non-existing file', () => {
    const cs = new CodeSearch()
    const result = cs.replace(
      'missing.ts',
      { pattern: 'x' } as SearchQuery,
      { replacement: 'y', all: false } as ReplaceOptions,
    )
    expect(result.replacements).toBe(0)
    expect(result.original).toBe('')
    expect(result.modified).toBe('')
  })

  it('updates file content after replacement', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'old')
    cs.replace(
      'a.ts',
      { pattern: 'old' } as SearchQuery,
      { replacement: 'new', all: false } as ReplaceOptions,
    )
    expect(cs.getFile('a.ts')).toBe('new')
  })

  it('invalidates index after replacement', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'old')
    cs.buildIndex()
    cs.replace(
      'a.ts',
      { pattern: 'old' } as SearchQuery,
      { replacement: 'new', all: false } as ReplaceOptions,
    )
    expect(cs.getIndex()).toBeNull()
  })

  it('does not invalidate index when no replacement', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.buildIndex()
    cs.replace(
      'a.ts',
      { pattern: 'xyz' } as SearchQuery,
      { replacement: 'new', all: false } as ReplaceOptions,
    )
    expect(cs.getIndex()).not.toBeNull()
  })

  it('supports regex replacement', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo123bar')
    const result = cs.replace(
      'a.ts',
      { pattern: '\\d+', isRegex: true } as SearchQuery,
      { replacement: 'NUM', all: false } as ReplaceOptions,
    )
    expect(result.modified).toBe('fooNUMbar')
  })

  it('supports capture group replacement with $1', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    const result = cs.replace(
      'a.ts',
      { pattern: '(hello) (world)', isRegex: true } as SearchQuery,
      { replacement: '$2 $1', all: false } as ReplaceOptions,
    )
    expect(result.modified).toBe('world hello')
  })

  it('supports named group replacement with $<name>', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    const result = cs.replace(
      'a.ts',
      { pattern: '(?<greeting>hello) (?<target>world)', isRegex: true } as SearchQuery,
      { replacement: '$<target> $<greeting>', all: false } as ReplaceOptions,
    )
    expect(result.modified).toBe('world hello')
  })

  it('respects caseSensitive in replace', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'Hello hello HELLO')
    const result = cs.replace(
      'a.ts',
      { pattern: 'hello', caseSensitive: true } as SearchQuery,
      { replacement: 'hi', all: true } as ReplaceOptions,
    )
    expect(result.replacements).toBe(1)
    expect(result.modified).toBe('Hello hi HELLO')
  })

  it('uses default replacement when not specified', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    const result = cs.replace(
      'a.ts',
      { pattern: 'hello' } as SearchQuery,
      {} as ReplaceOptions,
    )
    expect(result.replacements).toBe(1)
    expect(result.modified).toBe('')
  })
})

// ─── replaceAll ────────────────────────────────────────────────────
describe('replaceAll', () => {
  it('replaces across all files', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.addFile('b.ts', 'hello world')
    cs.addFile('c.ts', 'no match')
    const results = cs.replaceAll(
      { pattern: 'hello' } as SearchQuery,
      { replacement: 'hi', all: false } as ReplaceOptions,
    )
    expect(results).toHaveLength(2)
    expect(cs.getFile('a.ts')).toBe('hi')
    expect(cs.getFile('b.ts')).toBe('hi world')
    expect(cs.getFile('c.ts')).toBe('no match')
  })

  it('returns empty array when no matches', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo')
    const results = cs.replaceAll(
      { pattern: 'xyz' } as SearchQuery,
      { replacement: 'abc', all: false } as ReplaceOptions,
    )
    expect(results).toEqual([])
  })

  it('returns empty array when no files', () => {
    const cs = new CodeSearch()
    const results = cs.replaceAll(
      { pattern: 'x' } as SearchQuery,
      { replacement: 'y', all: false } as ReplaceOptions,
    )
    expect(results).toEqual([])
  })

  it('replaces all occurrences in each file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x x x')
    cs.addFile('b.ts', 'x')
    const results = cs.replaceAll(
      { pattern: 'x' } as SearchQuery,
      { replacement: 'y', all: true } as ReplaceOptions,
    )
    expect(results).toHaveLength(2)
    expect(cs.getFile('a.ts')).toBe('y y y')
    expect(cs.getFile('b.ts')).toBe('y')
  })
})

// ─── countMatches ──────────────────────────────────────────────────
describe('countMatches', () => {
  it('counts matches across all files', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello hello')
    cs.addFile('b.ts', 'hello')
    const count = cs.countMatches({ pattern: 'hello' } as SearchQuery)
    expect(count).toBe(3)
  })

  it('returns 0 for no matches', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo bar')
    expect(cs.countMatches({ pattern: 'xyz' } as SearchQuery)).toBe(0)
  })

  it('returns 0 for empty pattern', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    expect(cs.countMatches({ pattern: '' } as SearchQuery)).toBe(0)
  })

  it('returns 0 when no files', () => {
    const cs = new CodeSearch()
    expect(cs.countMatches({ pattern: 'hello' } as SearchQuery)).toBe(0)
  })

  it('respects filePattern filter', () => {
    const cs = new CodeSearch()
    cs.addFile('src/a.ts', 'test')
    cs.addFile('src/b.js', 'test')
    const count = cs.countMatches({
      pattern: 'test',
      filePattern: '*.ts',
    } as SearchQuery)
    expect(count).toBe(1)
  })

  it('respects caseSensitive flag', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'Hello hello HELLO')
    const ci = cs.countMatches({ pattern: 'hello' } as SearchQuery)
    expect(ci).toBe(3)
    const cs2 = cs.countMatches({
      pattern: 'hello',
      caseSensitive: true,
    } as SearchQuery)
    expect(cs2).toBe(1)
  })

  it('respects isRegex flag', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'abc123def456')
    const literal = cs.countMatches({ pattern: '\\d+' } as SearchQuery)
    expect(literal).toBe(0)
    const regex = cs.countMatches({
      pattern: '\\d+',
      isRegex: true,
    } as SearchQuery)
    expect(regex).toBe(2)
  })
})

// ─── getMatchingFiles ──────────────────────────────────────────────
describe('getMatchingFiles', () => {
  it('returns files with matches', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.addFile('b.ts', 'world')
    cs.addFile('c.ts', 'hello world')
    const files = cs.getMatchingFiles({ pattern: 'hello' } as SearchQuery)
    expect(files).toContain('a.ts')
    expect(files).toContain('c.ts')
    expect(files).not.toContain('b.ts')
  })

  it('returns empty array for no matches', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo')
    expect(cs.getMatchingFiles({ pattern: 'xyz' } as SearchQuery)).toEqual([])
  })

  it('returns empty array for no files', () => {
    const cs = new CodeSearch()
    expect(cs.getMatchingFiles({ pattern: 'hello' } as SearchQuery)).toEqual([])
  })

  it('respects filePattern', () => {
    const cs = new CodeSearch()
    cs.addFile('src/a.ts', 'test')
    cs.addFile('test/b.ts', 'test')
    const files = cs.getMatchingFiles({
      pattern: 'test',
      filePattern: 'src/*',
    } as SearchQuery)
    expect(files).toEqual(['src/a.ts'])
  })
})

// ─── getContext ────────────────────────────────────────────────────
describe('getContext', () => {
  it('returns context around a match', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3\nline4\nline5')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 3,
      columnStart: 0,
      columnEnd: 5,
      line: 'line3',
      match: 'line3',
    }
    expect(cs.getContext(match, 1, 1)).toBe('line2\nline3\nline4')
  })

  it('returns wider context', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3\nline4\nline5')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 3,
      columnStart: 0,
      columnEnd: 5,
      line: 'line3',
      match: 'line3',
    }
    expect(cs.getContext(match, 2, 2)).toBe('line1\nline2\nline3\nline4\nline5')
  })

  it('handles match at start of file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 1,
      columnStart: 0,
      columnEnd: 5,
      line: 'line1',
      match: 'line1',
    }
    expect(cs.getContext(match, 2, 1)).toBe('line1\nline2')
  })

  it('handles match at end of file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 3,
      columnStart: 0,
      columnEnd: 5,
      line: 'line3',
      match: 'line3',
    }
    expect(cs.getContext(match, 1, 2)).toBe('line2\nline3')
  })

  it('returns just the line when before and after are 0', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 2,
      columnStart: 0,
      columnEnd: 5,
      line: 'line2',
      match: 'line2',
    }
    expect(cs.getContext(match, 0, 0)).toBe('line2')
  })

  it('returns match line when file not found', () => {
    const cs = new CodeSearch()
    const match: SearchMatch = {
      filePath: 'missing.ts',
      lineNumber: 1,
      columnStart: 0,
      columnEnd: 5,
      line: 'content',
      match: 'content',
    }
    expect(cs.getContext(match, 1, 1)).toBe('content')
  })

  it('handles single-line file', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'only line')
    const match: SearchMatch = {
      filePath: 'a.ts',
      lineNumber: 1,
      columnStart: 0,
      columnEnd: 9,
      line: 'only line',
      match: 'only',
    }
    expect(cs.getContext(match, 5, 5)).toBe('only line')
  })
})

// ─── getStatistics ─────────────────────────────────────────────────
describe('getStatistics', () => {
  it('reports totalFiles correctly', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.addFile('b.ts', 'y')
    expect(cs.getStatistics().totalFiles).toBe(2)
  })

  it('reports totalLines correctly', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\nline3')
    cs.addFile('b.ts', 'single')
    expect(cs.getStatistics().totalLines).toBe(4)
  })

  it('reports indexSize as null before build', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    expect(cs.getStatistics().indexSize).toBeNull()
  })

  it('reports indexSize after build', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.addFile('b.ts', 'y')
    cs.buildIndex()
    expect(cs.getStatistics().indexSize).toBe(2)
  })

  it('reports lastSearchDuration after search', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello')
    cs.search({ pattern: 'hello' } as SearchQuery)
    expect(cs.getStatistics().lastSearchDuration).toBeGreaterThan(0)
  })

  it('updates totalFiles after remove', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.addFile('b.ts', 'y')
    cs.removeFile('a.ts')
    expect(cs.getStatistics().totalFiles).toBe(1)
  })
})

// ─── clear ─────────────────────────────────────────────────────────
describe('clear', () => {
  it('removes all files', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.addFile('b.ts', 'y')
    cs.clear()
    expect(cs.getFiles()).toEqual([])
    expect(cs.hasFile('a.ts')).toBe(false)
  })

  it('clears index', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.buildIndex()
    cs.clear()
    expect(cs.getIndex()).toBeNull()
  })

  it('resets statistics', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'x')
    cs.search({ pattern: 'x' } as SearchQuery)
    cs.clear()
    const stats = cs.getStatistics()
    expect(stats.totalFiles).toBe(0)
    expect(stats.totalLines).toBe(0)
    expect(stats.lastSearchDuration).toBe(0)
    expect(stats.indexSize).toBeNull()
  })

  it('allows adding files after clear', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'first')
    cs.clear()
    expect(cs.addFile('a.ts', 'second')).toBe(true)
    expect(cs.getFile('a.ts')).toBe('second')
  })
})

// ─── Special characters & edge cases ───────────────────────────────
describe('special characters and edge cases', () => {
  it('handles regex special characters in literal mode', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'function add(a, b) { return a + b; }')
    const result = cs.search({ pattern: 'a + b' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('a + b')
  })

  it('handles parentheses in literal mode', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo(bar)baz')
    const result = cs.search({ pattern: '(bar)' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('(bar)')
  })

  it('handles dollar sign in literal mode', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'price: $100')
    const result = cs.search({ pattern: '$100' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('$100')
  })

  it('handles dot in literal mode', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'file.ts other')
    const result = cs.search({ pattern: 'file.ts' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('file.ts')
  })

  it('handles pipe character in literal mode', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'a|b')
    const result = cs.search({ pattern: 'a|b' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.match).toBe('a|b')
  })

  it('handles empty content file', () => {
    const cs = new CodeSearch()
    cs.addFile('empty.ts', '')
    const result = cs.search({ pattern: 'anything' } as SearchQuery)
    expect(result.totalMatches).toBe(0)
    expect(result.filesSearched).toBe(1)
  })

  it('handles file with only newlines', () => {
    const cs = new CodeSearch()
    cs.addFile('newlines.ts', '\n\n\n')
    const result = cs.search({ pattern: 'x' } as SearchQuery)
    expect(result.totalMatches).toBe(0)
  })

  it('handles unicode content', () => {
    const cs = new CodeSearch()
    cs.addFile('i18n.ts', 'こんにちは世界')
    const result = cs.search({ pattern: '世界' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
  })

  it('handles regex pattern with character class', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'abc123xyz')
    const result = cs.search({ pattern: '[a-z]+', isRegex: true } as SearchQuery)
    expect(result.totalMatches).toBe(2)
    expect(result.matches[0]!.match).toBe('abc')
    expect(result.matches[1]!.match).toBe('xyz')
  })

  it('handles regex pattern with alternation', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'cat dog bird')
    const result = cs.search({ pattern: 'cat|dog', isRegex: true } as SearchQuery)
    expect(result.totalMatches).toBe(2)
  })

  it('handles filePattern with question mark', () => {
    const cs = new CodeSearch()
    cs.addFile('a1.ts', 'test')
    cs.addFile('a2.ts', 'test')
    cs.addFile('ab.ts', 'test')
    const result = cs.search({
      pattern: 'test',
      filePattern: 'a?.ts',
    } as SearchQuery)
    expect(result.filesWithMatches).toBe(3)
  })

  it('handles trailing newline in content', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2\n')
    const result = cs.search({ pattern: 'line2' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.lineNumber).toBe(2)
  })

  it('searchLine with regex wholeWord', () => {
    const cs = new CodeSearch()
    const result = cs.searchLine('test testing tested', {
      pattern: 'test',
      isRegex: true,
      wholeWord: true,
    } as SearchQuery)
    expect(result).not.toBeNull()
    expect(result!.match).toBe('test')
    expect(result!.columnStart).toBe(0)
  })

  it('replace with regex and capture groups', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', '2024-01-15')
    const result = cs.replace(
      'a.ts',
      { pattern: '(\\d{4})-(\\d{2})-(\\d{2})', isRegex: true } as SearchQuery,
      { replacement: '$3/$2/$1', all: false } as ReplaceOptions,
    )
    expect(result.modified).toBe('15/01/2024')
  })

  it('countMatches across multiple lines', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo\nbar\nfoo\nbar')
    expect(cs.countMatches({ pattern: 'foo' } as SearchQuery)).toBe(2)
    expect(cs.countMatches({ pattern: 'bar' } as SearchQuery)).toBe(2)
  })

  it('getMatchingFiles with regex query', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'foo123')
    cs.addFile('b.ts', 'bar')
    const files = cs.getMatchingFiles({
      pattern: '\\d+',
      isRegex: true,
    } as SearchQuery)
    expect(files).toEqual(['a.ts'])
  })

  it('search returns correct line content', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'first line\nsecond line\nthird line')
    const result = cs.search({ pattern: 'second' } as SearchQuery)
    expect(result.matches[0]!.line).toBe('second line')
    expect(result.matches[0]!.lineNumber).toBe(2)
  })

  it('handles very long lines', () => {
    const cs = new CodeSearch()
    const longLine = 'a'.repeat(10000) + 'TARGET' + 'b'.repeat(10000)
    cs.addFile('a.ts', longLine)
    const result = cs.search({ pattern: 'TARGET' } as SearchQuery)
    expect(result.totalMatches).toBe(1)
    expect(result.matches[0]!.columnStart).toBe(10000)
  })

  it('handles maxResults of 1', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'ab ab ab ab')
    const result = cs.search({ pattern: 'ab', maxResults: 1 } as SearchQuery)
    expect(result.totalMatches).toBe(1)
  })

  it('search across files stops at maxResults', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'test test')
    cs.addFile('b.ts', 'test test')
    cs.addFile('c.ts', 'test test')
    const result = cs.search({ pattern: 'test', maxResults: 3 } as SearchQuery)
    expect(result.totalMatches).toBe(3)
  })

  it('rebuilds index correctly after modifications', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'line1\nline2')
    cs.buildIndex()
    cs.addFile('b.ts', 'line3')
    expect(cs.getIndex()).toBeNull()
    const idx = cs.buildIndex()
    expect(idx.files.size).toBe(2)
  })

  it('replace with empty replacement deletes match', () => {
    const cs = new CodeSearch()
    cs.addFile('a.ts', 'hello world')
    const result = cs.replace(
      'a.ts',
      { pattern: 'hello ' } as SearchQuery,
      { replacement: '', all: false } as ReplaceOptions,
    )
    expect(result.modified).toBe('world')
  })
})
