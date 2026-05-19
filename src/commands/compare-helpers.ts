import { existsSync, statSync } from 'node:fs'
import * as fs from 'node:fs/promises'

// ─── Interfaces ──────────────────────────────────────────

export interface FileStats {
  filePath: string
  size: number
  totalLines: number
  codeLines: number
  blankLines: number
  commentLines: number
  imports: string[]
  exports: string[]
  functions: string[]
}

export interface ComparisonMetric {
  name: string
  file1Value: number | string
  file2Value: number | string
  diff: number | string
}

export interface CompareResult {
  file1: FileStats
  file2: FileStats
  metrics: ComparisonMetric[]
  similarity: number
}

// ─── Line counting ───────────────────────────────────────

function countLineTypes(content: string): {
  total: number
  code: number
  blank: number
  comment: number
} {
  const lines = content.split('\n')
  const total = lines.length
  let blank = 0
  let comment = 0
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      blank++
      continue
    }

    if (inBlockComment) {
      comment++
      if (trimmed.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    if (trimmed.startsWith('//')) {
      comment++
      continue
    }

    if (trimmed.startsWith('/*')) {
      comment++
      if (!trimmed.includes('*/')) {
        inBlockComment = true
      }
      continue
    }
  }

  const code = total - blank - comment
  return { blank, code, comment, total }
}

// ─── Import / Export / Function extraction ───────────────

function extractImports(content: string): string[] {
  const lines = content.split('\n')
  const imports: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^import\s/.test(trimmed)) {
      imports.push(trimmed)
    }
  }
  return imports
}

function extractExports(content: string): string[] {
  const lines = content.split('\n')
  const exports: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^export\s/.test(trimmed)) {
      exports.push(trimmed)
    }
  }
  return exports
}

function extractFunctions(content: string): string[] {
  const lines = content.split('\n')
  const functions: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      /\bfunction\b/.test(trimmed)
      || (/\bconst\b/.test(trimmed) && /=>/.test(trimmed))
    ) {
      functions.push(trimmed)
    }
  }
  return functions
}

// ─── analyzeFileStats ────────────────────────────────────

/**
 * Read a file from disk and compute structural stats.
 *
 * @example
 * ```ts
 * const stats = await analyzeFileStats('src/index.ts')
 * console.log(stats.totalLines) // 42
 * ```
 */
export async function analyzeFileStats(filePath: string): Promise<FileStats> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const stat = statSync(filePath)
  if (!stat.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`)
  }

  const content = await fs.readFile(filePath, 'utf8')
  const lineInfo = countLineTypes(content)

  return {
    blankLines: lineInfo.blank,
    codeLines: lineInfo.code,
    commentLines: lineInfo.comment,
    exports: extractExports(content),
    filePath,
    functions: extractFunctions(content),
    imports: extractImports(content),
    size: stat.size,
    totalLines: lineInfo.total,
  }
}

// ─── buildComparisonMetrics ──────────────────────────────

/**
 * Build a list of comparison metrics from two FileStats objects.
 *
 * @example
 * ```ts
 * const metrics = buildComparisonMetrics(stats1, stats2)
 * metrics.forEach(m => console.log(m.name, m.diff))
 * ```
 */
export function buildComparisonMetrics(
  file1: FileStats,
  file2: FileStats,
): ComparisonMetric[] {
  const fields: Array<{
    name: string
    file1Value: number
    file2Value: number
  }> = [
    { file1Value: file1.size, file2Value: file2.size, name: 'Size (bytes)' },
    { file1Value: file1.totalLines, file2Value: file2.totalLines, name: 'Total Lines' },
    { file1Value: file1.codeLines, file2Value: file2.codeLines, name: 'Code Lines' },
    { file1Value: file1.blankLines, file2Value: file2.blankLines, name: 'Blank Lines' },
    { file1Value: file1.commentLines, file2Value: file2.commentLines, name: 'Comment Lines' },
    { file1Value: file1.imports.length, file2Value: file2.imports.length, name: 'Imports' },
    { file1Value: file1.exports.length, file2Value: file2.exports.length, name: 'Exports' },
    { file1Value: file1.functions.length, file2Value: file2.functions.length, name: 'Functions' },
  ]

  return fields.map((field) => ({
    diff: field.file2Value - field.file1Value,
    file1Value: field.file1Value,
    file2Value: field.file2Value,
    name: field.name,
  }))
}

// ─── calculateSimilarity ─────────────────────────────────

/**
 * Compute Jaccard similarity of lines between two strings (0-1).
 *
 * Uses `Array.from(new Set())` for uniqueness — no Set spread.
 *
 * @example
 * ```ts
 * const sim = calculateSimilarity('a\nb\nc', 'a\nb\nd')
 * console.log(sim) // 0.5
 * ```
 */
export function calculateSimilarity(content1: string, content2: string): number {
  const lines1 = content1.split('\n').map((l) => l.trim())
  const lines2 = content2.split('\n').map((l) => l.trim())

  const set1 = Array.from(new Set(lines1))
  const set2 = Array.from(new Set(lines2))

  const set2Lookup = new Set(set2)
  const intersectionCount = set1.filter((item) => set2Lookup.has(item)).length

  const unionSet = new Set(lines1)
  for (const line of lines2) {
    unionSet.add(line)
  }
  const unionCount = Array.from(unionSet).length

  if (unionCount === 0) return 1.0
  return intersectionCount / unionCount
}
