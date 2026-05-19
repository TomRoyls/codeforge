import { extname } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface FileMetric {
  filePath: string
  relativePath: string
  size: number
  lines: number
  blankLines: number
  codeLines: number
  commentLines: number
  complexity: number
  todos: number
  extension: string
}

export interface TopResult {
  files: FileMetric[]
  metric: string
  totalCount: number
  totalAnalyzed: number
}

// ─── Complexity keywords ────────────────────────────────

const COMPLEXITY_KEYWORDS = /\b(if|else|for|while|switch|catch)\b|\?|&&|\|\|/g

// ─── TODO patterns ──────────────────────────────────────

const TODO_PATTERN = /\b(TODO|FIXME|HACK|XXX|BUG)\b/gi

// ─── analyzeFile ────────────────────────────────────────

/**
 * Analyze a file and calculate all metrics.
 *
 * @example
 * ```ts
 * const metric = analyzeFile('/abs/path/to/file.ts', 'src/file.ts')
 * console.log(metric.complexity, metric.todos)
 * ```
 */
export function analyzeFile(content: string, relativePath: string): FileMetric {
  const size = Buffer.byteLength(content, 'utf8')
  const extension = extname(relativePath).toLowerCase()
  const linesArray = content.split('\n')
  const lines = linesArray.length

  let blankLines = 0
  let commentLines = 0
  let codeLines = 0

  for (const line of linesArray) {
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      blankLines++
    } else if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      commentLines++
    } else {
      codeLines++
    }
  }

  // ─── Complexity: count decision points ────────────────
  const complexityMatches = content.match(COMPLEXITY_KEYWORDS)
  const complexity = complexityMatches !== null ? complexityMatches.length : 0

  // ─── TODOs: count TODO/FIXME/HACK/XXX/BUG ─────────────
  const todoMatches = content.match(TODO_PATTERN)
  const todos = todoMatches !== null ? todoMatches.length : 0

  return {
    blankLines,
    codeLines,
    commentLines,
    complexity,
    extension,
    filePath: relativePath,
    lines,
    relativePath,
    size,
    todos,
  }
}

// ─── rankFiles ──────────────────────────────────────────

export type MetricKey = 'blankLines' | 'codeLines' | 'commentLines' | 'complexity' | 'lines' | 'size' | 'todos'

/**
 * Rank files by a chosen metric, returning the top N.
 *
 * @example
 * ```ts
 * const top10 = rankFiles(metrics, 'size', 10, true)
 * ```
 */
export function rankFiles(files: FileMetric[], metric: MetricKey, count: number, descending: boolean): FileMetric[] {
  const sorted = Array.from(files)
  sorted.sort((a, b) => {
    const diff = b[metric] - a[metric]
    if (diff !== 0) return descending ? diff : -diff
    return a.relativePath.localeCompare(b.relativePath)
  })
  return sorted.slice(0, count)
}

// ─── filterByExtension ──────────────────────────────────

/**
 * Filter files by a list of extensions.
 *
 * @example
 * ```ts
 * const tsFiles = filterByExtension(files, ['.ts', '.tsx'])
 * ```
 */
export function filterByExtension(files: FileMetric[], extensions: string[]): FileMetric[] {
  if (extensions.length === 0) return files
  const normalized = extensions.map((e) => e.toLowerCase())
  return files.filter((f) => normalized.includes(f.extension.toLowerCase()))
}
