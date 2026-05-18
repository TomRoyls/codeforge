import type { SearchResult, SearchOptions, FileIndexData } from './types.js'
import { levenshteinDistance } from '../../utils/string-similarity.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

const globPatternCache = new Map<string, RegExp>()
const _searchRegexCache = new Map<string, RegExp>()

const SEARCH_EDIT_DISTANCE_THRESHOLD = 2

export class SearchEngine {
  private files: Map<string, FileIndexData> = new Map()

  setFiles(files: FileIndexData[]): void {
    this.files.clear()
    for (const file of files) {
      this.files.set(file.filePath, file)
    }
  }

  addFile(file: FileIndexData): void {
    this.files.set(file.filePath, file)
  }

  removeFile(filePath: string): void {
    this.files.delete(filePath)
  }

  search(query: string, options: SearchOptions): SearchResult[] {
    if (options.fuzzy) {
      return this.searchFuzzy(query, 2)
        .filter((r) => this.matchesOptions(r, options))
        .slice(0, options.maxResults)
    }
    return this.searchExact(query)
      .filter((r) => this.matchesOptions(r, options))
      .slice(0, options.maxResults)
  }

  searchExact(query: string): SearchResult[] {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    for (const file of this.files.values()) {
      const lines = this.getLines(file)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!
        const lowerLine = line.toLowerCase()
        let col = lowerLine.indexOf(lowerQuery)
        while (col !== -1) {
          results.push({
            filePath: file.filePath,
            line: i + 1,
            column: col + 1,
            match: line.substring(col, col + query.length),
            context: line.trim(),
            score: 1.0,
          })
          col = lowerLine.indexOf(lowerQuery, col + 1)
        }
      }

      for (const symbol of file.symbols) {
        if (symbol.name.toLowerCase() === lowerQuery) {
          results.push({
            filePath: file.filePath,
            line: symbol.line,
            column: symbol.column + 1,
            match: symbol.name,
            context: `${symbol.kind} ${symbol.name}`,
            score: 1.0,
          })
        }
      }
    }

    return results
  }

  searchFuzzy(query: string, maxDistance: number): SearchResult[] {
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()

    for (const file of this.files.values()) {
      const lines = this.getLines(file)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!
        const words = this.extractWords(line)
        for (const word of words) {
          const dist = this.levenshtein(word.toLowerCase(), queryLower)
          if (dist <= maxDistance) {
            const score = 1 - dist / Math.max(query.length, word.length)
            results.push({
              filePath: file.filePath,
              line: i + 1,
              column: line.indexOf(word) + 1,
              match: word,
              context: line.trim(),
              score,
            })
          }
        }
      }

      for (const symbol of file.symbols) {
        const dist = this.levenshtein(symbol.name.toLowerCase(), queryLower)
        if (dist <= maxDistance) {
          const score = 1 - dist / Math.max(query.length, symbol.name.length)
          results.push({
            filePath: file.filePath,
            line: symbol.line,
            column: symbol.column + 1,
            match: symbol.name,
            context: `${symbol.kind} ${symbol.name}`,
            score,
          })
        }
      }
    }

    return sortedByDesc(results, r => r.score)
  }

  searchRegex(pattern: string): SearchResult[] {
    let regex: RegExp
    try {
      const key = `${pattern}|gi`
      regex = _searchRegexCache.get(key) ?? new RegExp(pattern, 'gi')
      _searchRegexCache.set(key, regex)
    } catch {
      return []
    }
    const freshRegex = new RegExp(regex.source, regex.flags)

    const results: SearchResult[] = []

    for (const file of this.files.values()) {
      const lines = this.getLines(file)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!
        freshRegex.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = freshRegex.exec(line)) !== null) {
          results.push({
            filePath: file.filePath,
            line: i + 1,
            column: match.index + 1,
            match: match[0],
            context: line.trim(),
            score: 1.0,
          })
        }
      }
    }

    return results
  }

  suggest(prefix: string, limit: number): string[] {
    const candidates = new Set<string>()
    const lowerPrefix = prefix.toLowerCase()

    for (const file of this.files.values()) {
      for (const symbol of file.symbols) {
        if (symbol.name.toLowerCase().startsWith(lowerPrefix)) {
          candidates.add(symbol.name)
        }
      }

      const lines = this.getLines(file)
      for (const line of lines) {
        const words = this.extractWords(line)
        for (const word of words) {
          if (word.toLowerCase().startsWith(lowerPrefix) && word.length >= prefix.length) {
            candidates.add(word)
          }
        }
      }
    }

    return Array.from(candidates)
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1
        const bStartsWith = b.toLowerCase().startsWith(prefix.toLowerCase()) ? 0 : 1
        if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith
        return a.localeCompare(b)
      })
      .slice(0, limit)
  }

  private getLines(_file: FileIndexData): string[] {
    return []
  }

  searchInSource(filePath: string, source: string, query: string, options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = []
    const lines = source.split('\n')
    const lowerQuery = options.caseSensitive ? query : query.toLowerCase()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const searchLine = options.caseSensitive ? line : line.toLowerCase()

      if (options.fuzzy) {
        const words = this.extractWords(line)
        for (const word of words) {
          const wordForCompare = options.caseSensitive ? word : word.toLowerCase()
          const dist = this.levenshtein(wordForCompare, lowerQuery)
          if (dist <= SEARCH_EDIT_DISTANCE_THRESHOLD) {
            results.push({
              filePath,
              line: i + 1,
              column: line.indexOf(word) + 1,
              match: word,
              context: line.trim(),
              score: 1 - dist / Math.max(query.length, word.length),
            })
          }
        }
      } else {
        let col = searchLine.indexOf(lowerQuery)
        while (col !== -1) {
          results.push({
            filePath,
            line: i + 1,
            column: col + 1,
            match: line.substring(col, col + query.length),
            context: line.trim(),
            score: 1.0,
          })
          col = searchLine.indexOf(lowerQuery, col + 1)
        }
      }
    }

    return results
      .filter((r) => this.matchesFilePattern(r.filePath, options.filePattern))
      .slice(0, options.maxResults)
  }

  searchRegexInSource(filePath: string, source: string, pattern: string): SearchResult[] {
    let regex: RegExp
    try {
      const key = `${pattern}|gi`
      regex = _searchRegexCache.get(key) ?? new RegExp(pattern, 'gi')
      _searchRegexCache.set(key, regex)
    } catch {
      return []
    }
    const freshRegex = new RegExp(regex.source, regex.flags)

    const results: SearchResult[] = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      freshRegex.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = freshRegex.exec(line)) !== null) {
        results.push({
          filePath,
          line: i + 1,
          column: match.index + 1,
          match: match[0],
          context: line.trim(),
          score: 1.0,
        })
      }
    }

    return results
  }

  suggestFromSource(source: string, prefix: string, limit: number): string[] {
    const candidates = new Set<string>()
    const lowerPrefix = prefix.toLowerCase()
    const lines = source.split('\n')

    for (const line of lines) {
      const words = this.extractWords(line)
      for (const word of words) {
        if (word.toLowerCase().startsWith(lowerPrefix) && word.length >= prefix.length) {
          candidates.add(word)
        }
      }
    }

    return Array.from(candidates).sort().slice(0, limit)
  }

  private matchesOptions(result: SearchResult, options: SearchOptions): boolean {
    return this.matchesFilePattern(result.filePath, options.filePattern)
  }

  private matchesFilePattern(filePath: string, pattern: string | undefined): boolean {
    if (!pattern) return true
    let regex = globPatternCache.get(pattern)
    if (!regex) {
      regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
      globPatternCache.set(pattern, regex)
    }
    return regex.test(filePath)
  }

  private extractWords(line: string): string[] {
    return line.match(/[a-zA-Z_]\w*/g) ?? []
  }

  private levenshtein(a: string, b: string): number {
    return levenshteinDistance(a, b)
  }
}
