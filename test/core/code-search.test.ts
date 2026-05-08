import { describe, it, expect, beforeEach } from 'vitest'
import { CodeSearch } from '../../src/core/code-search/code-search.js'
import type {
  SearchQuery,
  SearchMatch,
  ReplaceOptions,
} from '../../src/core/code-search/types.js'

describe('CodeSearch', () => {
  let cs: CodeSearch

  beforeEach(() => {
    cs = new CodeSearch()
  })

  describe('file management', () => {
    it('addFile adds a file and returns true', () => {
      expect(cs.addFile('a.ts', 'hello')).toBe(true)
      expect(cs.hasFile('a.ts')).toBe(true)
    })

    it('addFile returns false for duplicate path', () => {
      cs.addFile('a.ts', 'hello')
      expect(cs.addFile('a.ts', 'world')).toBe(false)
    })

    it('removeFile removes a file and returns true', () => {
      cs.addFile('a.ts', 'hello')
      expect(cs.removeFile('a.ts')).toBe(true)
      expect(cs.hasFile('a.ts')).toBe(false)
    })

    it('removeFile returns false for missing file', () => {
      expect(cs.removeFile('missing.ts')).toBe(false)
    })

    it('getFile returns content for existing file', () => {
      cs.addFile('a.ts', 'content here')
      expect(cs.getFile('a.ts')).toBe('content here')
    })

    it('getFile returns undefined for missing file', () => {
      expect(cs.getFile('missing.ts')).toBeUndefined()
    })

    it('getFiles returns all file paths', () => {
      cs.addFile('a.ts', 'a')
      cs.addFile('b.ts', 'b')
      expect(cs.getFiles()).toEqual(['a.ts', 'b.ts'])
    })

    it('hasFile returns true for existing file', () => {
      cs.addFile('a.ts', 'a')
      expect(cs.hasFile('a.ts')).toBe(true)
    })

    it('hasFile returns false for missing file', () => {
      expect(cs.hasFile('nope.ts')).toBe(false)
    })

    it('clear removes all files', () => {
      cs.addFile('a.ts', 'a')
      cs.addFile('b.ts', 'b')
      cs.clear()
      expect(cs.getFiles()).toEqual([])
      expect(cs.getFile('a.ts')).toBeUndefined()
    })
  })

  describe('basic search', () => {
    it('finds plain text match', () => {
      cs.addFile('a.ts', 'hello world')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.totalMatches).toBe(1)
      expect(result.matches[0]!.match).toBe('hello')
    })

    it('case insensitive by default', () => {
      cs.addFile('a.ts', 'Hello World')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.totalMatches).toBe(1)
    })

    it('case sensitive when set', () => {
      cs.addFile('a.ts', 'Hello World')
      const result = cs.search({ pattern: 'hello', caseSensitive: true } as SearchQuery)
      expect(result.totalMatches).toBe(0)
    })

    it('case sensitive matches exact case', () => {
      cs.addFile('a.ts', 'Hello World')
      const result = cs.search({ pattern: 'Hello', caseSensitive: true } as SearchQuery)
      expect(result.totalMatches).toBe(1)
    })

    it('whole word match', () => {
      cs.addFile('a.ts', 'hello helloworld')
      const result = cs.search({ pattern: 'hello', wholeWord: true } as SearchQuery)
      expect(result.totalMatches).toBe(1)
      expect(result.matches[0]!.match).toBe('hello')
    })

    it('regex pattern match', () => {
      cs.addFile('a.ts', 'foo123bar')
      const result = cs.search({ pattern: '\\d+', isRegex: true } as SearchQuery)
      expect(result.totalMatches).toBe(1)
      expect(result.matches[0]!.match).toBe('123')
    })

    it('finds multiple matches across lines', () => {
      cs.addFile('a.ts', 'foo\nbar\nfoo')
      const result = cs.search({ pattern: 'foo' } as SearchQuery)
      expect(result.totalMatches).toBe(2)
    })
  })

  describe('search results', () => {
    it('reports correct line numbers', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const result = cs.search({ pattern: 'line3' } as SearchQuery)
      expect(result.matches[0]!.lineNumber).toBe(3)
    })

    it('reports correct column positions', () => {
      cs.addFile('a.ts', 'abc def ghi')
      const result = cs.search({ pattern: 'def' } as SearchQuery)
      expect(result.matches[0]!.columnStart).toBe(4)
      expect(result.matches[0]!.columnEnd).toBe(7)
    })

    it('reports correct match text', () => {
      cs.addFile('a.ts', 'the quick brown fox')
      const result = cs.search({ pattern: 'quick brown' } as SearchQuery)
      expect(result.matches[0]!.match).toBe('quick brown')
    })

    it('reports correct total count', () => {
      cs.addFile('a.ts', 'aaa aaa aaa')
      const result = cs.search({ pattern: 'aaa' } as SearchQuery)
      expect(result.totalMatches).toBe(3)
    })

    it('reports filesSearched', () => {
      cs.addFile('a.ts', 'hello')
      cs.addFile('b.ts', 'world')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.filesSearched).toBe(2)
    })

    it('reports filesWithMatches', () => {
      cs.addFile('a.ts', 'hello')
      cs.addFile('b.ts', 'world')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.filesWithMatches).toBe(1)
    })

    it('reports duration >= 0', () => {
      cs.addFile('a.ts', 'hello')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('includes full line text', () => {
      cs.addFile('a.ts', 'find me here')
      const result = cs.search({ pattern: 'me' } as SearchQuery)
      expect(result.matches[0]!.line).toBe('find me here')
    })

    it('respects maxResults', () => {
      cs.addFile('a.ts', 'a a a a a a a a a a')
      const result = cs.search({ pattern: 'a', maxResults: 3 } as SearchQuery)
      expect(result.totalMatches).toBe(3)
    })
  })

  describe('searchFile', () => {
    it('searches a single file', () => {
      cs.addFile('a.ts', 'hello world')
      cs.addFile('b.ts', 'hello universe')
      const matches = cs.searchFile('a.ts', { pattern: 'hello' } as SearchQuery)
      expect(matches).toHaveLength(1)
      expect(matches[0]!.filePath).toBe('a.ts')
    })

    it('finds multiple matches in a file', () => {
      cs.addFile('a.ts', 'x x x')
      const matches = cs.searchFile('a.ts', { pattern: 'x' } as SearchQuery)
      expect(matches).toHaveLength(3)
    })

    it('returns empty for no matches', () => {
      cs.addFile('a.ts', 'hello')
      const matches = cs.searchFile('a.ts', { pattern: 'world' } as SearchQuery)
      expect(matches).toHaveLength(0)
    })

    it('returns empty for missing file', () => {
      const matches = cs.searchFile('missing.ts', { pattern: 'x' } as SearchQuery)
      expect(matches).toHaveLength(0)
    })
  })

  describe('searchLine', () => {
    it('returns match info for matching line', () => {
      const result = cs.searchLine('hello world', { pattern: 'world' } as SearchQuery)
      expect(result).not.toBeNull()
      expect(result!.match).toBe('world')
      expect(result!.columnStart).toBe(6)
      expect(result!.columnEnd).toBe(11)
    })

    it('returns null for no match', () => {
      const result = cs.searchLine('hello world', { pattern: 'xyz' } as SearchQuery)
      expect(result).toBeNull()
    })

    it('respects case sensitivity', () => {
      const result = cs.searchLine('Hello', { pattern: 'hello', caseSensitive: true } as SearchQuery)
      expect(result).toBeNull()
    })

    it('returns null for empty pattern', () => {
      const result = cs.searchLine('hello', { pattern: '' } as SearchQuery)
      expect(result).toBeNull()
    })

    it('works with regex', () => {
      const result = cs.searchLine('abc 123 def', { pattern: '\\d+', isRegex: true } as SearchQuery)
      expect(result).not.toBeNull()
      expect(result!.match).toBe('123')
    })

    it('works with wholeWord', () => {
      const result = cs.searchLine('test testing', { pattern: 'test', wholeWord: true } as SearchQuery)
      expect(result).not.toBeNull()
      expect(result!.match).toBe('test')
    })
  })

  describe('index', () => {
    it('buildIndex creates an index', () => {
      cs.addFile('a.ts', 'line1\nline2')
      const index = cs.buildIndex()
      expect(index).toBeDefined()
      expect(index.files).toBeInstanceOf(Map)
      expect(index.files.has('a.ts')).toBe(true)
    })

    it('getIndex returns null before build', () => {
      cs.addFile('a.ts', 'content')
      expect(cs.getIndex()).toBeNull()
    })

    it('getIndex returns index after build', () => {
      cs.addFile('a.ts', 'content')
      cs.buildIndex()
      expect(cs.getIndex()).not.toBeNull()
    })

    it('index contains all files', () => {
      cs.addFile('a.ts', 'a')
      cs.addFile('b.ts', 'b')
      const index = cs.buildIndex()
      expect(index.files.size).toBe(2)
    })

    it('index contains lines split by newline', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const index = cs.buildIndex()
      const lines = index.files.get('a.ts')
      expect(lines).toEqual(['line1', 'line2', 'line3'])
    })

    it('index builtAt is a number', () => {
      cs.addFile('a.ts', 'x')
      const index = cs.buildIndex()
      expect(typeof index.builtAt).toBe('number')
      expect(index.builtAt).toBeGreaterThan(0)
    })

    it('index is invalidated on addFile', () => {
      cs.addFile('a.ts', 'a')
      cs.buildIndex()
      cs.addFile('b.ts', 'b')
      expect(cs.getIndex()).toBeNull()
    })

    it('index is invalidated on removeFile', () => {
      cs.addFile('a.ts', 'a')
      cs.buildIndex()
      cs.removeFile('a.ts')
      expect(cs.getIndex()).toBeNull()
    })
  })

  describe('replace', () => {
    it('replaces single occurrence', () => {
      cs.addFile('a.ts', 'hello world')
      const result = cs.replace('a.ts', { pattern: 'hello' } as SearchQuery, { replacement: 'hi' } as ReplaceOptions)
      expect(result.replacements).toBe(1)
      expect(result.modified).toBe('hi world')
    })

    it('replaces all occurrences', () => {
      cs.addFile('a.ts', 'aaa bbb aaa')
      const result = cs.replace('a.ts', { pattern: 'aaa' } as SearchQuery, { replacement: 'xxx', all: true } as ReplaceOptions)
      expect(result.replacements).toBe(2)
      expect(result.modified).toBe('xxx bbb xxx')
    })

    it('returns original content', () => {
      cs.addFile('a.ts', 'hello')
      const result = cs.replace('a.ts', { pattern: 'hello' } as SearchQuery, { replacement: 'hi' } as ReplaceOptions)
      expect(result.original).toBe('hello')
    })

    it('no match returns zero replacements', () => {
      cs.addFile('a.ts', 'hello')
      const result = cs.replace('a.ts', { pattern: 'world' } as SearchQuery, { replacement: 'hi' } as ReplaceOptions)
      expect(result.replacements).toBe(0)
      expect(result.modified).toBe('hello')
    })

    it('regex replace with groups', () => {
      cs.addFile('a.ts', 'foo123bar')
      const result = cs.replace(
        'a.ts',
        { pattern: '(\\d+)', isRegex: true } as SearchQuery,
        { replacement: '[$1]', all: false } as ReplaceOptions,
      )
      expect(result.replacements).toBe(1)
      expect(result.modified).toBe('foo[123]bar')
    })

    it('updates file content after replace', () => {
      cs.addFile('a.ts', 'old')
      cs.replace('a.ts', { pattern: 'old' } as SearchQuery, { replacement: 'new' } as ReplaceOptions)
      expect(cs.getFile('a.ts')).toBe('new')
    })

    it('returns zero for missing file', () => {
      const result = cs.replace('missing.ts', { pattern: 'x' } as SearchQuery, { replacement: 'y' } as ReplaceOptions)
      expect(result.replacements).toBe(0)
    })
  })

  describe('replaceAll', () => {
    it('replaces across multiple files', () => {
      cs.addFile('a.ts', 'hello world')
      cs.addFile('b.ts', 'hello universe')
      const results = cs.replaceAll({ pattern: 'hello' } as SearchQuery, { replacement: 'hi' } as ReplaceOptions)
      expect(results).toHaveLength(2)
      expect(cs.getFile('a.ts')).toBe('hi world')
      expect(cs.getFile('b.ts')).toBe('hi universe')
    })

    it('only returns files with replacements', () => {
      cs.addFile('a.ts', 'hello')
      cs.addFile('b.ts', 'world')
      const results = cs.replaceAll({ pattern: 'hello' } as SearchQuery, { replacement: 'hi' } as ReplaceOptions)
      expect(results).toHaveLength(1)
    })

    it('returns empty array when no matches', () => {
      cs.addFile('a.ts', 'hello')
      const results = cs.replaceAll({ pattern: 'xyz' } as SearchQuery, { replacement: 'abc' } as ReplaceOptions)
      expect(results).toHaveLength(0)
    })
  })

  describe('countMatches', () => {
    it('counts matches across all files', () => {
      cs.addFile('a.ts', 'aaa aaa')
      cs.addFile('b.ts', 'aaa')
      expect(cs.countMatches({ pattern: 'aaa' } as SearchQuery)).toBe(3)
    })

    it('returns 0 for no matches', () => {
      cs.addFile('a.ts', 'hello')
      expect(cs.countMatches({ pattern: 'xyz' } as SearchQuery)).toBe(0)
    })

    it('returns 0 when no files', () => {
      expect(cs.countMatches({ pattern: 'x' } as SearchQuery)).toBe(0)
    })

    it('counts regex matches', () => {
      cs.addFile('a.ts', 'abc 123 def 456')
      expect(cs.countMatches({ pattern: '\\d+', isRegex: true } as SearchQuery)).toBe(2)
    })
  })

  describe('getMatchingFiles', () => {
    it('returns files that contain matches', () => {
      cs.addFile('a.ts', 'hello')
      cs.addFile('b.ts', 'world')
      cs.addFile('c.ts', 'hello world')
      const files = cs.getMatchingFiles({ pattern: 'hello' } as SearchQuery)
      expect(files).toEqual(['a.ts', 'c.ts'])
    })

    it('returns empty for no matches', () => {
      cs.addFile('a.ts', 'hello')
      const files = cs.getMatchingFiles({ pattern: 'xyz' } as SearchQuery)
      expect(files).toEqual([])
    })

    it('returns empty when no files', () => {
      const files = cs.getMatchingFiles({ pattern: 'x' } as SearchQuery)
      expect(files).toEqual([])
    })
  })

  describe('getContext', () => {
    it('gets surrounding lines', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3\nline4\nline5')
      const match: SearchMatch = {
        filePath: 'a.ts',
        lineNumber: 3,
        columnStart: 0,
        columnEnd: 5,
        line: 'line3',
        match: 'line3',
      }
      const context = cs.getContext(match, 1, 1)
      expect(context).toBe('line2\nline3\nline4')
    })

    it('handles before=0', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const match: SearchMatch = {
        filePath: 'a.ts',
        lineNumber: 3,
        columnStart: 0,
        columnEnd: 5,
        line: 'line3',
        match: 'line3',
      }
      const context = cs.getContext(match, 0, 1)
      expect(context).toBe('line3')
    })

    it('handles after=0', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const match: SearchMatch = {
        filePath: 'a.ts',
        lineNumber: 1,
        columnStart: 0,
        columnEnd: 5,
        line: 'line1',
        match: 'line1',
      }
      const context = cs.getContext(match, 1, 0)
      expect(context).toBe('line1')
    })

    it('handles start boundary', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const match: SearchMatch = {
        filePath: 'a.ts',
        lineNumber: 1,
        columnStart: 0,
        columnEnd: 5,
        line: 'line1',
        match: 'line1',
      }
      const context = cs.getContext(match, 5, 0)
      expect(context).toBe('line1')
    })

    it('handles end boundary', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const match: SearchMatch = {
        filePath: 'a.ts',
        lineNumber: 3,
        columnStart: 0,
        columnEnd: 5,
        line: 'line3',
        match: 'line3',
      }
      const context = cs.getContext(match, 0, 5)
      expect(context).toBe('line3')
    })

    it('returns line for missing file', () => {
      const match: SearchMatch = {
        filePath: 'missing.ts',
        lineNumber: 1,
        columnStart: 0,
        columnEnd: 3,
        line: 'abc',
        match: 'abc',
      }
      const context = cs.getContext(match, 2, 2)
      expect(context).toBe('abc')
    })
  })

  describe('statistics', () => {
    it('reports totalFiles', () => {
      cs.addFile('a.ts', 'a')
      cs.addFile('b.ts', 'b')
      const stats = cs.getStatistics()
      expect(stats.totalFiles).toBe(2)
    })

    it('reports totalLines', () => {
      cs.addFile('a.ts', 'line1\nline2\nline3')
      const stats = cs.getStatistics()
      expect(stats.totalLines).toBe(3)
    })

    it('reports indexSize as null before build', () => {
      cs.addFile('a.ts', 'a')
      const stats = cs.getStatistics()
      expect(stats.indexSize).toBeNull()
    })

    it('reports indexSize after build', () => {
      cs.addFile('a.ts', 'a')
      cs.buildIndex()
      const stats = cs.getStatistics()
      expect(stats.indexSize).toBe(1)
    })

    it('reports lastSearchDuration', () => {
      cs.addFile('a.ts', 'hello')
      cs.search({ pattern: 'hello' } as SearchQuery)
      const stats = cs.getStatistics()
      expect(stats.lastSearchDuration).toBeGreaterThanOrEqual(0)
    })

    it('reports 0 duration before search', () => {
      const stats = cs.getStatistics()
      expect(stats.lastSearchDuration).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('empty file', () => {
      cs.addFile('a.ts', '')
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.totalMatches).toBe(0)
    })

    it('empty query returns no matches', () => {
      cs.addFile('a.ts', 'hello world')
      const result = cs.search({ pattern: '' } as SearchQuery)
      expect(result.totalMatches).toBe(0)
    })

    it('special regex chars in plain text', () => {
      cs.addFile('a.ts', 'price is $10.00')
      const result = cs.search({ pattern: '$10.00' } as SearchQuery)
      expect(result.totalMatches).toBe(1)
    })

    it('very long line', () => {
      const longLine = 'a'.repeat(10000)
      cs.addFile('a.ts', longLine)
      const result = cs.search({ pattern: 'a', maxResults: 5 } as SearchQuery)
      expect(result.totalMatches).toBe(5)
    })

    it('no files returns empty result', () => {
      const result = cs.search({ pattern: 'hello' } as SearchQuery)
      expect(result.totalMatches).toBe(0)
      expect(result.filesSearched).toBe(0)
    })

    it('filePattern filters files', () => {
      cs.addFile('src/a.ts', 'hello')
      cs.addFile('src/b.js', 'hello')
      const result = cs.search({ pattern: 'hello', filePattern: '*.ts' } as SearchQuery)
      expect(result.totalMatches).toBe(1)
      expect(result.matches[0]!.filePath).toBe('src/a.ts')
    })

    it('clear resets statistics', () => {
      cs.addFile('a.ts', 'hello')
      cs.search({ pattern: 'hello' } as SearchQuery)
      cs.clear()
      const stats = cs.getStatistics()
      expect(stats.totalFiles).toBe(0)
      expect(stats.lastSearchDuration).toBe(0)
    })

    it('multiple matches on same line', () => {
      cs.addFile('a.ts', 'aaa aaa aaa')
      const result = cs.search({ pattern: 'aaa' } as SearchQuery)
      expect(result.totalMatches).toBe(3)
      expect(result.matches[0]!.columnStart).toBe(0)
      expect(result.matches[1]!.columnStart).toBe(4)
      expect(result.matches[2]!.columnStart).toBe(8)
    })
  })
})
