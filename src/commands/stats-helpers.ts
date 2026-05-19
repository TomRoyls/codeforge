// ─── Interfaces ──────────────────────────────────────────

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

/**
 * @example
 * const fs: FileStats = {
 *   filePath: 'src/index.ts',
 *   language: 'TypeScript',
 *   totalLines: 100,
 *   codeLines: 70,
 *   commentLines: 10,
 *   blankLines: 20,
 *   functions: 5,
 *   classes: 1,
 *   imports: 8,
 *   exports: 4,
 * }
 */
export interface FileStats {
  filePath: string
  language: string
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  functions: number
  classes: number
  imports: number
  exports: number
}

/**
 * @example
 * const result: StatsResult = {
 *   totalFiles: 10,
 *   totalLines: 1000,
 *   totalCodeLines: 700,
 *   totalCommentLines: 100,
 *   totalBlankLines: 200,
 *   totalFunctions: 50,
 *   totalClasses: 10,
 *   totalImports: 80,
 *   totalExports: 40,
 *   languages: [],
 *   maintainability: { index: 85, avgLinesPerFile: 100, avgFunctionLength: 14, commentRatio: 0.125, exportRatio: 0.5, grade: 'B' },
 *   largestFiles: [],
 *   smallestFiles: [],
 *   fileStats: [],
 * }
 */
export interface StatsResult {
  totalFiles: number
  totalLines: number
  totalCodeLines: number
  totalCommentLines: number
  totalBlankLines: number
  totalFunctions: number
  totalClasses: number
  totalImports: number
  totalExports: number
  languages: LanguageStats[]
  maintainability: MaintainabilityIndex
  largestFiles: FileStats[]
  smallestFiles: FileStats[]
  fileStats: FileStats[]
}

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

// ─── File analysis ──────────────────────────────────────

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

// ─── Language stats aggregation ─────────────────────────

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

// ─── Maintainability index ──────────────────────────────

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

// ─── Build stats result ─────────────────────────────────

/**
 * Orchestrate full stats computation from discovered files.
 * @example
 * const result = buildStatsResult(files, contentReader)
 * // { totalFiles: 10, totalLines: 500, languages: [...], ... }
 */
export async function buildStatsResult(
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
