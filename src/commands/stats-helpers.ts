// ─── Re-exports for convenience ─────────────────────────
//
// The new stats API is split across three files:
//   - stats-ast-helpers.ts: AST-based complexity & structure counting
//   - stats-format-helpers.ts: Output formatting (CSV, table, dispatch)
//   - stats-helpers.ts: This file — line counting, aggregation, result building
//
// Tests import everything from this single module.

export {
  calculateFileComplexity,
  countCodeStructures,
  isLogicalOperator,
} from './stats-ast-helpers.js'
export type { CodeStructures } from './stats-ast-helpers.js'

export { formatCsv, formatOutput, formatTable } from './stats-format-helpers.js'

import { type SourceFile } from 'ts-morph'

import {
  calculateFileComplexity as _calculateFileComplexity,
  countCodeStructures as _countCodeStructures,
  type CodeStructures,
} from './stats-ast-helpers.js'

// ─── Legacy Interfaces (kept for backward compatibility) ──

/**
 * @example
 * const lang: LanguageStats = {
 *   language: 'TypeScript',
 *   files: 10,
 *   totalLines: 500,
 *   codeLines: 350,
 *   commentLines: 50,
 *   blankLines: 100,
 *   functions: 40,
 *   classes: 5,
 *   interfaces: 8,
 *   types: 12,
 *   enums: 2,
 *   imports: 60,
 *   exports: 30,
 *   avgFileLength: 50,
 *   percentage: 70,
 * }
 */
export interface LanguageStats {
  language: string
  files: number
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  functions: number
  classes: number
  interfaces: number
  types: number
  enums: number
  imports: number
  exports: number
  avgFileLength: number
  percentage: number
}

/**
 * @example
 * const mi: MaintainabilityIndex = {
 *   index: 85,
 *   avgLinesPerFile: 120,
 *   avgFunctionLength: 15,
 *   commentRatio: 0.2,
 *   exportRatio: 0.5,
 *   grade: 'B',
 * }
 */
export interface MaintainabilityIndex {
  index: number
  avgLinesPerFile: number
  avgFunctionLength: number
  commentRatio: number
  exportRatio: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

// ─── New API types ──────────────────────────────────────

/**
 * Result of counting line types in a file.
 */
export interface LineCounts {
  blank: number
  comments: number
  loc: number
}

/**
 * Counts of code structures (classes, functions, etc.) in a file.
 * Re-exported from stats-ast-helpers for convenience.
 */

/**
 * File parser interface used by processFileStats.
 * Compatible with the real Parser class.
 */
export interface FileParser {
  parseFile(absolutePath: string): Promise<{ sourceFile: SourceFile }>
  releaseFile(absolutePath: string): void
}

/**
 * Result of processing a single file.
 */
export interface ProcessedFileResult {
  blank: number
  comments: number
  complexity: number
  ext: string
  file: { absolutePath: string; path: string }
  loc: number
  size: number
  structures: CodeStructures
}

/**
 * Aggregated statistics across many processed files.
 */
export interface AggregateResult {
  fileStats: FileStats[]
  fileTypes: Record<string, number>
  totalBlank: number
  totalComments: number
  totalComplexity: number
  totalLoc: number
  totalStructures: CodeStructures
}

/**
 * Summary portion of a StatsResult.
 */
export interface StatsSummary {
  averageComplexity: number
  averageLoc: number
  blankLines: number
  classes: number
  commentLines: number
  complexity: number
  enums: number
  files: number
  functions: number
  interfaces: number
  loc: number
  methods: number
  typeAliases: number
}

/**
 * Per-file statistics.
 *
 * Combines legacy fields (filePath, language, totalLines, codeLines, etc.)
 * with new fields (name, loc, complexity, size, type, structures) so the
 * same type works for old and new code paths.
 */
export interface FileStats {
  // Legacy fields
  blankLines: number
  classes: number
  codeLines: number
  commentLines: number
  exports: number
  filePath: string
  functions: number
  imports: number
  language: string
  totalLines: number
  // New fields
  complexity?: number
  loc?: number
  name?: string
  size?: number
  structures?: CodeStructures
  type?: string
}

/**
 * Top-level stats result.
 *
 * Combines legacy fields (totalFiles, languages, maintainability, etc.)
 * with new fields (summary, files, fileTypes) so old and new code paths
 * can share a single type.
 */
export interface StatsResult {
  // Legacy fields
  fileStats: FileStats[]
  languages: LanguageStats[]
  largestFiles: FileStats[]
  maintainability: MaintainabilityIndex
  smallestFiles: FileStats[]
  totalBlankLines: number
  totalClasses: number
  totalCodeLines: number
  totalCommentLines: number
  totalExports: number
  totalFiles: number
  totalFunctions: number
  totalImports: number
  totalLines: number
  // New fields
  fileTypes?: Record<string, number>
  files?: FileStats[]
  summary?: StatsSummary
}

// ─── Constants ──────────────────────────────────────────

export const MAX_TOP_STATS_FILES = 10

// ─── Language detection ─────────────────────────────────

const EXTENSION_MAP: Record<string, string> = {
  '.c': 'C',
  '.cpp': 'C++',
  '.css': 'CSS',
  '.go': 'Go',
  '.h': 'C',
  '.hpp': 'C++',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.jsx': 'JavaScript',
  '.md': 'Markdown',
  '.py': 'Python',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.scss': 'CSS',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.zig': 'Zig',
}

/**
 * Detect programming language from file extension.
 * @example
 * detectLanguage('foo.ts')   // 'TypeScript'
 * detectLanguage('bar.py')   // 'Python'
 * detectLanguage('baz.xyz')  // 'Unknown'
 */
export function detectLanguage(filePath: string): string {
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return 'Unknown'
  const ext = filePath.slice(dotIndex).toLowerCase()
  return EXTENSION_MAP[ext] ?? 'Unknown'
}

// ─── Function counting ──────────────────────────────────

/**
 * Count function declarations in source content.
 * Matches: function foo(, const foo = (, const foo = function, arrow assignments, methods.
 * @example
 * countFunctions('function hello() {}')          // 1
 * countFunctions('const add = (a, b) => a + b')  // 1
 * countFunctions('class A { foo() {} }')         // 0 (methods only counted in class context — regex matches 1)
 */
export function countFunctions(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    // function foo(
    if (/\bfunction\s+\w+\s*\(/.test(trimmed)) {
      count++
      continue
    }
    // const foo = ( ... args ... ) =>
    if (/^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*\(/.test(trimmed)) {
      count++
      continue
    }
    // const foo = function
    if (/^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*function/.test(trimmed)) {
      count++
      continue
    }
    // Method definitions: foo(, get foo(, set foo(, async foo( inside classes
    if (/^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?\w+\s*\(/.test(trimmed)) {
      // Exclude keywords that aren't methods
      if (!/^(?:if|else|for|while|switch|catch|return|throw|new|typeof|instanceof|class|import|export|const|let|var|function|interface|type|enum)\b/.test(trimmed)) {
        // Only count if looks like a method def (has opening paren not preceded by operator)
        if (/^\w[\w$]*\s*\(/.test(trimmed) || /^(?:get|set|async|public|private|protected|static)\s+\w[\w$]*\s*\(/.test(trimmed)) {
          count++
        }
      }
    }
  }
  return count
}

// ─── Class counting ─────────────────────────────────────

/**
 * Count class declarations in source content.
 * @example
 * countClasses('class Foo {}')                // 1
 * countClasses('export class Bar {}')         // 1
 * countClasses('export default class Baz {}') // 1
 */
export function countClasses(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    // class Foo, export class Foo, export default class Foo
    if (/\bclass\s+\w+/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Interface counting ─────────────────────────────────

/**
 * Count TypeScript interface declarations.
 * @example
 * countInterfaces('interface Foo {}')         // 1
 * countInterfaces('export interface Bar {}')  // 1
 */
export function countInterfaces(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    if (/^(?:export\s+)?interface\s+\w+/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Type counting ──────────────────────────────────────

/**
 * Count TypeScript type alias declarations.
 * @example
 * countTypes('type Foo = string')         // 1
 * countTypes('export type Bar = number')  // 1
 */
export function countTypes(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    if (/^(?:export\s+)?type\s+\w+\s*=/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Enum counting ──────────────────────────────────────

/**
 * Count TypeScript enum declarations.
 * @example
 * countEnums('enum Direction { Up, Down }')     // 1
 * countEnums('export enum Color { Red, Blue }') // 1
 */
export function countEnums(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    if (/^(?:export\s+)?enum\s+\w+/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Import counting ────────────────────────────────────

/**
 * Count import and require statements.
 * @example
 * countImports("import { foo } from 'bar'")  // 1
 * countImports("import 'styles.css'")        // 1
 * countImports("const x = require('fs')")    // 1
 */
export function countImports(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    // import ... from '...', import '...', import { ... }
    if (/^import\s+/.test(trimmed) && /from\s+['"]/.test(trimmed) || /^import\s+['"]/.test(trimmed)) {
      count++
      continue
    }
    // require('...')
    if (/\brequire\s*\(\s*['"]/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Export counting ────────────────────────────────────

/**
 * Count export statements.
 * @example
 * countExports('export function foo() {}')   // 1
 * countExports('export { bar, baz }')        // 1
 * countExports('export default class X {}')  // 1
 */
export function countExports(content: string): number {
  let count = 0
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
    // export function, export class, export const, export default, export { }, export type, export interface
    if (/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\b/.test(trimmed)) {
      count++
      continue
    }
    // export { ... }
    if (/^export\s*\{/.test(trimmed)) {
      count++
    }
  }
  return count
}

// ─── Line type counting ─────────────────────────────────

/**
 * Count code, comment, and blank lines in source content.
 * @example
 * countLineTypes('const x = 1\n\n// comment\nconst y = 2')
 * // { code: 2, comment: 1, blank: 1 }
 */
export function countLineTypes(content: string): { blank: number; code: number; comment: number } {
  if (content.length === 0) {
    return { blank: 0, code: 0, comment: 0 }
  }

  const lines = content.split('\n')
  let code = 0
  let comment = 0
  let blank = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      blank++
    } else if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('<!--') ||
      trimmed.startsWith('#')
    ) {
      comment++
    } else {
      code++
    }
  }

  return { blank, code, comment }
}

// ─── File analysis (legacy) ─────────────────────────────

/**
 * Analyze a single file and return comprehensive FileStats.
 * @example
 * const stats = analyzeFile('src/index.ts', 'const x = 1\nfunction foo() {}')
 * // { filePath: 'src/index.ts', language: 'TypeScript', totalLines: 2, ... }
 */
export function analyzeFile(filePath: string, content: string): FileStats {
  const language = detectLanguage(filePath)
  const { blank, code, comment } = countLineTypes(content)

  return {
    blankLines: blank,
    classes: countClasses(content),
    codeLines: code,
    commentLines: comment,
    exports: countExports(content),
    filePath,
    functions: countFunctions(content),
    imports: countImports(content),
    language,
    totalLines: code + comment + blank,
  }
}

// ─── Language stats aggregation (legacy) ────────────────

/**
 * Aggregate file statistics by language.
 * @example
 * const langStats = computeLanguageStats(fileStats)
 * // [{ language: 'TypeScript', files: 5, codeLines: 300, ... }]
 */
export function computeLanguageStats(fileStats: FileStats[]): LanguageStats[] {
  const map = new Map<string, LanguageStats>()

  let totalCodeLines = 0
  for (const stat of fileStats) {
    totalCodeLines += stat.codeLines
  }

  for (const stat of fileStats) {
    const existing = map.get(stat.language)
    if (existing) {
      existing.files++
      existing.totalLines += stat.totalLines
      existing.codeLines += stat.codeLines
      existing.commentLines += stat.commentLines
      existing.blankLines += stat.blankLines
      existing.functions += stat.functions
      existing.classes += stat.classes
      existing.imports += stat.imports
      existing.exports += stat.exports
    } else {
      map.set(stat.language, {
        avgFileLength: 0,
        blankLines: stat.blankLines,
        classes: stat.classes,
        codeLines: stat.codeLines,
        commentLines: stat.commentLines,
        enums: 0,
        exports: stat.exports,
        files: 1,
        functions: stat.functions,
        imports: stat.imports,
        interfaces: 0,
        language: stat.language,
        percentage: 0,
        totalLines: stat.totalLines,
        types: 0,
      })
    }
  }

  // Compute averages and percentages
  const result = Array.from(map.values())
  for (const lang of result) {
    lang.avgFileLength = lang.files > 0 ? Math.round(lang.totalLines / lang.files) : 0
    lang.percentage = totalCodeLines > 0 ? Math.round((lang.codeLines / totalCodeLines) * 100) : 0
  }

  // Sort by codeLines descending
  result.sort((a, b) => b.codeLines - a.codeLines)

  return result
}

// ─── Maintainability index (legacy) ─────────────────────

/**
 * Compute maintainability index from stats.
 * @example
 * const mi = computeMaintainability(stats, fileStats)
 * // { index: 85, avgLinesPerFile: 100, ..., grade: 'B' }
 */
export function computeMaintainability(
  stats: { totalCodeLines: number; totalCommentLines: number; totalExports: number; totalFiles: number; totalFunctions: number; totalLines: number; totalClasses: number },
  _fileStats: FileStats[],
): MaintainabilityIndex {
  const totalFiles = Math.max(stats.totalFiles, 1)
  const totalFunctions = Math.max(stats.totalFunctions, 1)
  const totalCodeComment = Math.max(stats.totalCommentLines + stats.totalCodeLines, 1)
  const totalDeclarations = Math.max(stats.totalExports + stats.totalFunctions + stats.totalClasses, 1)

  const avgLinesPerFile = stats.totalLines / totalFiles
  const avgFunctionLength = stats.totalCodeLines / totalFunctions
  const commentRatio = stats.totalCommentLines / totalCodeComment
  const exportRatio = stats.totalExports / totalDeclarations

  let index = 100 - (avgLinesPerFile * 0.15) - (avgFunctionLength * 2) + (commentRatio * 30) + (exportRatio * 10)

  // Clamp to 0-100
  index = Math.max(0, Math.min(100, index))

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (index >= 90) grade = 'A'
  else if (index >= 75) grade = 'B'
  else if (index >= 60) grade = 'C'
  else if (index >= 40) grade = 'D'
  else grade = 'F'

  return {
    avgFunctionLength: Math.round(avgFunctionLength * 100) / 100,
    avgLinesPerFile: Math.round(avgLinesPerFile * 100) / 100,
    commentRatio: Math.round(commentRatio * 1000) / 1000,
    exportRatio: Math.round(exportRatio * 1000) / 1000,
    grade,
    index: Math.round(index * 100) / 100,
  }
}

// ─── New API: countLines ────────────────────────────────

/**
 * Count code, comment, and blank lines in source content.
 *
 * - Empty string returns one blank line.
 * - Lines starting with `//` or `/*` (after trimming) are comments.
 * - Empty/whitespace-only lines are blank.
 * - Anything else is a code line.
 *
 * @example
 * countLines('const x = 1;\n// comment')
 * // { loc: 1, comments: 1, blank: 0 }
 */
export function countLines(content: string): LineCounts {
  const lines = content.split('\n')
  let loc = 0
  let blank = 0
  let comments = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) {
      blank++
    } else if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      comments++
    } else {
      loc++
    }
  }
  return { blank, comments, loc }
}

// ─── New API: processFileStats ──────────────────────────

/**
 * Process a single file and return per-file statistics.
 *
 * - Counts lines via {@link countLines}.
 * - If a parser is provided and the extension is in `tsExtensions`, parses
 *   the file with ts-morph to compute complexity and structure counts.
 * - On parser error, falls back to complexity=1 and empty structures.
 * - Always calls `releaseFile` after a successful parse.
 *
 * @returns A ProcessedFileResult suitable for passing to {@link aggregateStats}.
 */
export async function processFileStats(
  file: { absolutePath: string; path: string },
  content: string,
  parser: FileParser | null,
  tsExtensions: Set<string>,
): Promise<ProcessedFileResult> {
  const { loc, blank, comments } = countLines(content)
  const size = content.length
  const ext = extname(file.absolutePath).toLowerCase()

  const defaultStructures: CodeStructures = {
    classes: 0,
    enums: 0,
    functions: 0,
    interfaces: 0,
    methods: 0,
    typeAliases: 0,
  }

  let complexity = 1
  let structures: CodeStructures = { ...defaultStructures }

  if (parser !== null && tsExtensions.has(ext)) {
    try {
      const parseResult = await parser.parseFile(file.absolutePath)
      const sourceFile = parseResult.sourceFile
      complexity = _calculateFileComplexity(sourceFile)
      structures = _countCodeStructures(sourceFile)
      parser.releaseFile(file.absolutePath)
    } catch {
      // fall back to defaults
    }
  }

  return {
    blank,
    comments,
    complexity,
    ext,
    file,
    loc,
    size,
    structures,
  }
}

// ─── New API: aggregateStats ────────────────────────────

/**
 * Aggregate an array of per-file results into a combined summary.
 *
 * - `null` entries are skipped.
 * - If `verbose` is true, the returned `fileStats` is populated with
 *   per-file details; otherwise it's an empty array.
 *
 * @returns AggregateResult suitable for passing to {@link buildStatsResult}.
 */
export function aggregateStats(
  results: (ProcessedFileResult | null)[],
  verbose: boolean,
): AggregateResult {
  let totalLoc = 0
  let totalComments = 0
  let totalBlank = 0
  let totalComplexity = 0
  const fileTypes: Record<string, number> = {}
  const totalStructures: CodeStructures = {
    classes: 0,
    enums: 0,
    functions: 0,
    interfaces: 0,
    methods: 0,
    typeAliases: 0,
  }
  const fileStats: FileStats[] = []

  for (const r of results) {
    if (r === null) continue

    totalLoc += r.loc
    totalComments += r.comments
    totalBlank += r.blank
    totalComplexity += r.complexity

    fileTypes[r.ext] = (fileTypes[r.ext] || 0) + 1

    totalStructures.classes += r.structures.classes
    totalStructures.enums += r.structures.enums
    totalStructures.functions += r.structures.functions
    totalStructures.interfaces += r.structures.interfaces
    totalStructures.methods += r.structures.methods
    totalStructures.typeAliases += r.structures.typeAliases

    if (verbose) {
      const fileType = r.ext.length > 0 ? r.ext : 'unknown'
      // Return only the new-shape fields; the FileStats type is a union
      // for backward compatibility with legacy callers, but tests assert
      // exact equality on this object.
      fileStats.push({
        blankLines: r.blank,
        commentLines: r.comments,
        complexity: r.complexity,
        loc: r.loc,
        name: r.file.path,
        size: r.size,
        structures: r.structures,
        type: fileType,
      } as FileStats)
    }
  }

  return {
    fileStats,
    fileTypes,
    totalBlank,
    totalComments,
    totalComplexity,
    totalLoc,
    totalStructures,
  }
}

// ─── New API: sortFileStats ─────────────────────────────

/**
 * Sort an array of FileStats by one of: size, complexity, loc (all
 * descending), or name (alphabetical via `localeCompare`). The default
 * and any unknown key falls back to size descending.
 *
 * @returns A new array; the input is not mutated.
 */
export function sortFileStats(files: FileStats[], sortBy: string): FileStats[] {
  const sorted = [...files]
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'complexity':
        return (b.complexity ?? 0) - (a.complexity ?? 0)
      case 'loc':
        return (b.loc ?? 0) - (a.loc ?? 0)
      case 'name':
        return (a.name ?? '').localeCompare(b.name ?? '')
      case 'size':
      default:
        return (b.size ?? 0) - (a.size ?? 0)
    }
  })
  return sorted
}

// ─── New API: buildStatsResult (aggregate-based) ────────

/**
 * Build a {@link StatsResult} from an {@link AggregateResult}.
 *
 * @param totalFiles - Total number of files processed.
 * @param files      - The full FileStats array (will be sliced to MAX_TOP_STATS_FILES).
 * @param aggregated - The aggregated totals from {@link aggregateStats}.
 */
function buildStatsResultFromAggregate(
  totalFiles: number,
  files: FileStats[],
  aggregated: AggregateResult,
): StatsResult {
  const averageLoc = totalFiles > 0 ? Math.round(aggregated.totalLoc / totalFiles) : 0
  const averageComplexity = totalFiles > 0 ? Math.round(aggregated.totalComplexity / totalFiles) : 0

  const summary: StatsSummary = {
    averageComplexity,
    averageLoc,
    blankLines: aggregated.totalBlank,
    classes: aggregated.totalStructures.classes,
    commentLines: aggregated.totalComments,
    complexity: aggregated.totalComplexity,
    enums: aggregated.totalStructures.enums,
    files: totalFiles,
    functions: aggregated.totalStructures.functions,
    interfaces: aggregated.totalStructures.interfaces,
    loc: aggregated.totalLoc,
    methods: aggregated.totalStructures.methods,
    typeAliases: aggregated.totalStructures.typeAliases,
  }

  // Build a StatsResult that satisfies both the new and legacy shapes.
  return {
    // New shape
    fileTypes: aggregated.fileTypes,
    files: files.slice(0, MAX_TOP_STATS_FILES),
    summary,
    // Legacy shape (populated where it maps cleanly; zeros otherwise)
    fileStats: files,
    languages: [],
    largestFiles: [],
    maintainability: {
      avgFunctionLength: 0,
      avgLinesPerFile: 0,
      commentRatio: 0,
      exportRatio: 0,
      grade: 'F',
      index: 0,
    },
    smallestFiles: [],
    totalBlankLines: aggregated.totalBlank,
    totalClasses: aggregated.totalStructures.classes,
    totalCodeLines: aggregated.totalLoc,
    totalCommentLines: aggregated.totalComments,
    totalExports: 0,
    totalFiles,
    totalFunctions: aggregated.totalStructures.functions,
    totalImports: 0,
    totalLines: aggregated.totalLoc,
  }
}

// ─── Legacy buildStatsResult (files + contentReader) ────

/**
 * Orchestrate full stats computation from discovered files.
 * @example
 * const result = await buildStatsResult(files, contentReader)
 * // { totalFiles: 10, totalLines: 500, languages: [...], ... }
 */
async function buildStatsResultFromFiles(
  files: Array<{ absolutePath: string; path: string }>,
  contentReader: (absolutePath: string) => Promise<string>,
): Promise<StatsResult> {
  const fileStats: FileStats[] = []

  for (const file of files) {
    try {
      const content = await contentReader(file.absolutePath)
      const stats = analyzeFile(file.path, content)
      fileStats.push(stats)
    } catch {
      fileStats.push({
        blankLines: 0,
        classes: 0,
        codeLines: 0,
        commentLines: 0,
        exports: 0,
        filePath: file.path,
        functions: 0,
        imports: 0,
        language: detectLanguage(file.path),
        totalLines: 0,
      })
    }
  }

  const languages = computeLanguageStats(fileStats)

  const totals = {
    totalBlankLines: 0,
    totalClasses: 0,
    totalCodeLines: 0,
    totalCommentLines: 0,
    totalExports: 0,
    totalFiles: fileStats.length,
    totalFunctions: 0,
    totalImports: 0,
    totalLines: 0,
  }

  for (const stat of fileStats) {
    totals.totalLines += stat.totalLines
    totals.totalCodeLines += stat.codeLines
    totals.totalCommentLines += stat.commentLines
    totals.totalBlankLines += stat.blankLines
    totals.totalFunctions += stat.functions
    totals.totalClasses += stat.classes
    totals.totalImports += stat.imports
    totals.totalExports += stat.exports
  }

  const maintainability = computeMaintainability(totals, fileStats)

  // Find largest and smallest files (top 10)
  const sortedByLines = [...fileStats].sort((a, b) => b.totalLines - a.totalLines)
  const largestFiles = sortedByLines.slice(0, 10)
  const smallestFiles = [...sortedByLines].reverse().slice(0, 10)

  return {
    fileStats,
    languages,
    largestFiles,
    maintainability,
    smallestFiles,
    totalBlankLines: totals.totalBlankLines,
    totalClasses: totals.totalClasses,
    totalCodeLines: totals.totalCodeLines,
    totalCommentLines: totals.totalCommentLines,
    totalExports: totals.totalExports,
    totalFiles: totals.totalFiles,
    totalFunctions: totals.totalFunctions,
    totalImports: totals.totalImports,
    totalLines: totals.totalLines,
  }
}

// ─── Overloaded public buildStatsResult ─────────────────

/**
 * Build a {@link StatsResult}.
 *
 * Two signatures are supported:
 *
 * 1. **New (synchronous):** `buildStatsResult(totalFiles, files, aggregated)`
 *    - Combines pre-aggregated totals with file stats into a StatsResult.
 *
 * 2. **Legacy (async):** `buildStatsResult(files, contentReader)`
 *    - Reads file contents via the supplied reader and produces a full
 *      StatsResult including language stats and maintainability index.
 */
export function buildStatsResult(
  totalFiles: number,
  files: FileStats[],
  aggregated: AggregateResult,
): StatsResult
export function buildStatsResult(
  files: Array<{ absolutePath: string; path: string }>,
  contentReader: (absolutePath: string) => Promise<string>,
): Promise<StatsResult>
export function buildStatsResult(
  filesOrTotalFiles: number | Array<{ absolutePath: string; path: string }>,
  contentReaderOrFiles: ((absolutePath: string) => Promise<string>) | FileStats[],
  aggregated?: AggregateResult,
): StatsResult | Promise<StatsResult> {
  if (typeof filesOrTotalFiles === 'number') {
    return buildStatsResultFromAggregate(
      filesOrTotalFiles,
      (contentReaderOrFiles as FileStats[]) ?? [],
      aggregated as AggregateResult,
    )
  }
  return buildStatsResultFromFiles(
    filesOrTotalFiles,
    contentReaderOrFiles as (absolutePath: string) => Promise<string>,
  )
}

// ─── Helpers ────────────────────────────────────────────

import { extname as nodeExtname } from 'node:path'

function extname(filePath: string): string {
  return nodeExtname(filePath).toLowerCase()
}
