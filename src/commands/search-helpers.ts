// ─── Interfaces ──────────────────────────────────────────

export interface SearchMatch {
  line: number
  column: number
  text: string
  context: {
    before: string[]
    after: string[]
  }
}

export interface FileResult {
  filePath: string
  relativePath: string
  matches: SearchMatch[]
  totalMatches: number
}

export interface SearchResult {
  files: FileResult[]
  pattern: string
  totalFiles: number
  totalMatches: number
  filesWithMatches: number
}

export interface SearchOptions {
  caseSensitive: boolean
  contextLines: number
  maxMatches: number
}

// ─── Content searching ──────────────────────────────────

/**
 * Search content for regex pattern matches.
 *
 * @example
 * searchInContent('hello world', 'hello', { caseSensitive: true, contextLines: 2, maxMatches: 0 })
 * // => [{ line: 1, column: 1, text: 'hello world', context: { before: [], after: [] } }]
 */
export function searchInContent(
  content: string,
  pattern: string,
  options: SearchOptions,
): SearchMatch[] {
  const { caseSensitive, contextLines, maxMatches } = options

  if (content.length === 0 || pattern.length === 0) {
    return []
  }

  let regex: RegExp
  try {
    const flags = caseSensitive ? 'g' : 'gi'
    regex = new RegExp(pattern, flags)
  } catch {
    return []
  }

  const lines = content.split('\n')
  const matches: SearchMatch[] = []
  let totalMatches = 0

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx] as string

    // Reset lastIndex for each line since we search per-line
    regex.lastIndex = 0
    let matchResult: RegExpExecArray | null = regex.exec(line)

    // Collect all match positions on this line to handle multiple matches
    const lineMatchColumns: number[] = []
    while (matchResult !== null) {
      lineMatchColumns.push(matchResult.index + 1) // 1-based column
      matchResult = regex.exec(line)

      // Safety: prevent infinite loops for zero-length matches
      if (matchResult !== null && matchResult.index === regex.lastIndex - 1 && matchResult[0].length === 0) {
        regex.lastIndex++
      }
    }

    if (lineMatchColumns.length === 0) continue

    // Build context lines
    const beforeStart = Math.max(0, lineIdx - contextLines)
    const afterEnd = Math.min(lines.length - 1, lineIdx + contextLines)

    const before = lines.slice(beforeStart, lineIdx)
    const after = lines.slice(lineIdx + 1, afterEnd + 1)

    // For multiple matches on the same line, we create one SearchMatch per match position
    for (const col of lineMatchColumns) {
      matches.push({
        context: {
          after: [...after],
          before: [...before],
        },
        column: col,
        line: lineIdx + 1, // 1-based
        text: line,
      })
      totalMatches++
      if (maxMatches > 0 && totalMatches >= maxMatches) {
        return matches
      }
    }
  }

  return matches
}

// ─── File searching ─────────────────────────────────────

export interface FileInput {
  absolutePath: string
  path: string
}

/**
 * Search across files for regex pattern matches.
 *
 * @example
 * const results = await searchFiles([{ absolutePath: '/a.ts', path: 'a.ts' }], 'function', opts)
 */
export async function searchFiles(
  files: FileInput[],
  pattern: string,
  options: SearchOptions,
): Promise<FileResult[]> {
  const results: FileResult[] = []

  for (const file of files) {
    try {
      const { readFile } = await import('node:fs/promises')
      const content = await readFile(file.absolutePath, 'utf8')
      const matches = searchInContent(content, pattern, options)

      if (matches.length > 0) {
        results.push({
          filePath: file.absolutePath,
          matches,
          relativePath: file.path,
          totalMatches: matches.length,
        })
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return results
}

// ─── Aggregation ────────────────────────────────────────

/**
 * Aggregate file results into a SearchResult with totals.
 *
 * @example
 * const result = aggregateResults(fileResults, 'TODO')
 */
export function aggregateResults(fileResults: FileResult[], pattern: string): SearchResult {
  let totalMatches = 0

  for (const file of fileResults) {
    totalMatches += file.totalMatches
  }

  return {
    files: fileResults,
    filesWithMatches: fileResults.length,
    pattern,
    totalFiles: fileResults.length,
    totalMatches,
  }
}

// ─── Highlighting ───────────────────────────────────────

const MATCH_START_MARKER = '\x00MS\x00'
const MATCH_END_MARKER = '\x00ME\x00'

/**
 * Wraps matched portion with markers for later colorization.
 *
 * @example
 * highlightMatch('hello world', 0, 5) // => '\x00MS\x00hello\x00ME\x00 world'
 */
export function highlightMatch(text: string, matchStart: number, matchEnd: number): string {
  return text.slice(0, matchStart) + MATCH_START_MARKER + text.slice(matchStart, matchEnd) + MATCH_END_MARKER + text.slice(matchEnd)
}

/**
 * Get the marker strings used for highlighting.
 * Exported for use in format helpers.
 */
export function getMatchMarkers(): { start: string; end: string } {
  return { end: MATCH_END_MARKER, start: MATCH_START_MARKER }
}
