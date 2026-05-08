import type {
  SearchQuery,
  SearchMatch,
  SearchResult,
  SearchIndex,
  ReplaceOptions,
  ReplaceResult,
} from './types.js'
import { DEFAULT_SEARCH_QUERY, DEFAULT_REPLACE_OPTIONS } from './types.js'

export class CodeSearch {
  private files: Map<string, string> = new Map()
  private index: SearchIndex | null = null
  private lastSearchDuration: number = 0

  addFile(path: string, content: string): boolean {
    if (this.files.has(path)) {
      return false
    }
    this.files.set(path, content)
    this.index = null
    return true
  }

  removeFile(path: string): boolean {
    if (!this.files.has(path)) {
      return false
    }
    this.files.delete(path)
    this.index = null
    return true
  }

  getFile(path: string): string | undefined {
    return this.files.get(path)
  }

  getFiles(): string[] {
    return Array.from(this.files.keys())
  }

  hasFile(path: string): boolean {
    return this.files.has(path)
  }

  search(query: SearchQuery): SearchResult {
    const start = performance.now()
    const fullQuery: SearchQuery = {
      pattern: query.pattern,
      isRegex: query.isRegex ?? DEFAULT_SEARCH_QUERY.isRegex,
      caseSensitive: query.caseSensitive ?? DEFAULT_SEARCH_QUERY.caseSensitive,
      wholeWord: query.wholeWord ?? DEFAULT_SEARCH_QUERY.wholeWord,
      filePattern: query.filePattern,
      maxResults: query.maxResults ?? DEFAULT_SEARCH_QUERY.maxResults,
    }

    const matches: SearchMatch[] = []
    const matchingFileSet = new Set<string>()

    for (const [filePath, content] of this.files) {
      if (fullQuery.filePattern) {
        if (!this.matchesFilePattern(filePath, fullQuery.filePattern)) {
          continue
        }
      }
      const fileMatches = this.searchFileContent(filePath, content, fullQuery)
      for (const m of fileMatches) {
        matches.push(m)
        matchingFileSet.add(filePath)
        if (matches.length >= fullQuery.maxResults) {
          break
        }
      }
      if (matches.length >= fullQuery.maxResults) {
        break
      }
    }

    const duration = performance.now() - start
    this.lastSearchDuration = duration

    return {
      query: fullQuery,
      matches,
      totalMatches: matches.length,
      filesSearched: this.files.size,
      filesWithMatches: matchingFileSet.size,
      duration,
    }
  }

  searchFile(filePath: string, query: SearchQuery): SearchMatch[] {
    const content = this.files.get(filePath)
    if (content === undefined) {
      return []
    }
    const fullQuery: SearchQuery = {
      pattern: query.pattern,
      isRegex: query.isRegex ?? DEFAULT_SEARCH_QUERY.isRegex,
      caseSensitive: query.caseSensitive ?? DEFAULT_SEARCH_QUERY.caseSensitive,
      wholeWord: query.wholeWord ?? DEFAULT_SEARCH_QUERY.wholeWord,
      filePattern: query.filePattern,
      maxResults: query.maxResults ?? DEFAULT_SEARCH_QUERY.maxResults,
    }
    return this.searchFileContent(filePath, content, fullQuery)
  }

  searchLine(
    line: string,
    query: SearchQuery,
  ): { match: string; columnStart: number; columnEnd: number } | null {
    if (!query.pattern) {
      return null
    }

    const flags = query.caseSensitive ? 'g' : 'gi'
    let regex: RegExp

    if (query.isRegex) {
      const source = query.wholeWord ? `\\b(?:${query.pattern})\\b` : query.pattern
      regex = new RegExp(source, flags)
    } else {
      const escaped = query.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const source = query.wholeWord ? `\\b${escaped}\\b` : escaped
      regex = new RegExp(source, flags)
    }

    const result = regex.exec(line)
    if (result === null) {
      return null
    }

    return {
      match: result[0],
      columnStart: result.index,
      columnEnd: result.index + result[0].length,
    }
  }

  buildIndex(): SearchIndex {
    const fileLines = new Map<string, string[]>()
    for (const [path, content] of this.files) {
      fileLines.set(path, content.split('\n'))
    }
    this.index = {
      files: fileLines,
      builtAt: Date.now(),
    }
    return this.index
  }

  getIndex(): SearchIndex | null {
    return this.index
  }

  replace(filePath: string, query: SearchQuery, options: ReplaceOptions): ReplaceResult {
    const content = this.files.get(filePath)
    if (content === undefined) {
      return {
        filePath,
        replacements: 0,
        original: '',
        modified: '',
      }
    }

    const fullQuery: SearchQuery = {
      pattern: query.pattern,
      isRegex: query.isRegex ?? DEFAULT_SEARCH_QUERY.isRegex,
      caseSensitive: query.caseSensitive ?? DEFAULT_SEARCH_QUERY.caseSensitive,
      wholeWord: query.wholeWord ?? DEFAULT_SEARCH_QUERY.wholeWord,
      filePattern: query.filePattern,
      maxResults: query.maxResults ?? DEFAULT_SEARCH_QUERY.maxResults,
    }

    const fullOptions: ReplaceOptions = {
      replacement: options.replacement ?? DEFAULT_REPLACE_OPTIONS.replacement,
      all: options.all ?? DEFAULT_REPLACE_OPTIONS.all,
    }

    const regex = this.buildRegex(fullQuery)
    let count = 0

    const modified = content.replace(regex, (...args: unknown[]) => {
      if (fullOptions.all) {
        count++
        return this.applyReplacement(fullOptions.replacement, args)
      }
      if (count === 0) {
        count++
        return this.applyReplacement(fullOptions.replacement, args)
      }
      return args[0] as string
    })

    if (count > 0) {
      this.files.set(filePath, modified)
      this.index = null
    }

    return {
      filePath,
      replacements: count,
      original: content,
      modified,
    }
  }

  replaceAll(query: SearchQuery, options: ReplaceOptions): ReplaceResult[] {
    const results: ReplaceResult[] = []
    for (const filePath of this.files.keys()) {
      const result = this.replace(filePath, query, options)
      if (result.replacements > 0) {
        results.push(result)
      }
    }
    return results
  }

  countMatches(query: SearchQuery): number {
    const fullQuery: SearchQuery = {
      pattern: query.pattern,
      isRegex: query.isRegex ?? DEFAULT_SEARCH_QUERY.isRegex,
      caseSensitive: query.caseSensitive ?? DEFAULT_SEARCH_QUERY.caseSensitive,
      wholeWord: query.wholeWord ?? DEFAULT_SEARCH_QUERY.wholeWord,
      filePattern: query.filePattern,
      maxResults: Number.MAX_SAFE_INTEGER,
    }

    let count = 0
    for (const [filePath, content] of this.files) {
      if (fullQuery.filePattern) {
        if (!this.matchesFilePattern(filePath, fullQuery.filePattern)) {
          continue
        }
      }
      count += this.countInContent(content, fullQuery)
    }
    return count
  }

  getMatchingFiles(query: SearchQuery): string[] {
    const fullQuery: SearchQuery = {
      pattern: query.pattern,
      isRegex: query.isRegex ?? DEFAULT_SEARCH_QUERY.isRegex,
      caseSensitive: query.caseSensitive ?? DEFAULT_SEARCH_QUERY.caseSensitive,
      wholeWord: query.wholeWord ?? DEFAULT_SEARCH_QUERY.wholeWord,
      filePattern: query.filePattern,
      maxResults: query.maxResults ?? DEFAULT_SEARCH_QUERY.maxResults,
    }

    const result: string[] = []
    for (const [filePath, content] of this.files) {
      if (fullQuery.filePattern) {
        if (!this.matchesFilePattern(filePath, fullQuery.filePattern)) {
          continue
        }
      }
      if (this.countInContent(content, fullQuery) > 0) {
        result.push(filePath)
      }
    }
    return result
  }

  getContext(match: SearchMatch, before: number, after: number): string {
    const content = this.files.get(match.filePath)
    if (content === undefined) {
      return match.line
    }

    const lines = content.split('\n')
    const lineIdx = match.lineNumber - 1
    const start = Math.max(0, lineIdx - before)
    const end = Math.min(lines.length - 1, lineIdx + after)

    const contextLines: string[] = []
    for (let i = start; i <= end; i++) {
      const line = lines[i]
      if (line !== undefined) {
        contextLines.push(line)
      }
    }

    return contextLines.join('\n')
  }

  getStatistics(): {
    totalFiles: number
    totalLines: number
    indexSize: number | null
    lastSearchDuration: number
  } {
    let totalLines = 0
    for (const content of this.files.values()) {
      totalLines += content.split('\n').length
    }

    return {
      totalFiles: this.files.size,
      totalLines,
      indexSize: this.index !== null ? this.index.files.size : null,
      lastSearchDuration: this.lastSearchDuration,
    }
  }

  clear(): void {
    this.files.clear()
    this.index = null
    this.lastSearchDuration = 0
  }

  private searchFileContent(
    filePath: string,
    content: string,
    query: SearchQuery,
  ): SearchMatch[] {
    if (!query.pattern) {
      return []
    }

    const lines = content.split('\n')
    const matches: SearchMatch[] = []
    const regex = this.buildRegex(query)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue

      let matchResult: RegExpExecArray | null
      const globalRegex = new RegExp(regex.source, regex.flags)

      while ((matchResult = globalRegex.exec(line)) !== null) {
        matches.push({
          filePath,
          lineNumber: i + 1,
          columnStart: matchResult.index,
          columnEnd: matchResult.index + matchResult[0].length,
          line,
          match: matchResult[0],
        })
        if (matches.length >= query.maxResults) {
          return matches
        }
        if (matchResult[0].length === 0) {
          globalRegex.lastIndex++
        }
      }
    }

    return matches
  }

  private buildRegex(query: SearchQuery): RegExp {
    const flags = query.caseSensitive ? 'g' : 'gi'
    let source: string

    if (query.isRegex) {
      source = query.pattern
    } else {
      source = query.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    if (query.wholeWord) {
      source = `\\b${source}\\b`
    }

    return new RegExp(source, flags)
  }

  private countInContent(content: string, query: SearchQuery): number {
    if (!query.pattern) {
      return 0
    }

    const regex = this.buildRegex(query)
    const matches = content.match(regex)
    return matches !== null ? matches.length : 0
  }

  private matchesFilePattern(filePath: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    return new RegExp(regexPattern).test(filePath)
  }

  private applyReplacement(replacement: string, args: unknown[]): string {
    if (args.length < 3) return replacement

    const groups = args[args.length - 1] as Record<string, string> | undefined
    let result = replacement

    for (let i = 1; i < args.length - 2; i++) {
      const group = args[i] as string | undefined
      if (group !== undefined) {
        result = result.replace(new RegExp(`\\$${i}`, 'g'), group)
      }
    }

    if (groups) {
      for (const [name, value] of Object.entries(groups)) {
        result = result.replace(new RegExp(`\\$<${name}>`, 'g'), value)
      }
    }

    return result
  }
}
