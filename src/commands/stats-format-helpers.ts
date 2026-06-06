import chalk from 'chalk'

import type { FileStats, StatsResult } from './stats-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── ASCII bar chart ────────────────────────────────────

/**
 * Format a percentage as an ASCII bar chart.
 * @example
 * formatLanguageBar(65)  // '████████████████░░░░░░░░'
 */
export function formatLanguageBar(percentage: number): string {
  const barWidth = 24
  const filled = Math.round((percentage / 100) * barWidth)
  const empty = barWidth - filled
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty))
}

// ─── Grade formatting ───────────────────────────────────

/**
 * Format a maintainability grade with color.
 * @example
 * formatGrade('A')  // green 'A'
 * formatGrade('F')  // red 'F'
 */
export function formatGrade(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A': return chalk.green.bold(grade)
    case 'B': return chalk.blue.bold(grade)
    case 'C': return chalk.yellow.bold(grade)
    case 'D': return chalk.hex('#FFA500').bold(grade)
    case 'F': return chalk.red.bold(grade)
  }
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format stats as a rich table output.
 * @example
 * const output = formatStatsTable(result, false, 'lines')
 */
export function formatStatsTable(result: StatsResult, detailed: boolean, sort: string): string {
  const lines: string[] = [chalk.bold('\n📊 Codebase Statistics Dashboard'), '']

  // ─── Overview section ─────────────────────────────────
  lines.push(chalk.bold('Overview'))
  lines.push(`  Total files:       ${chalk.cyan(String(result.totalFiles))}`)
  lines.push(`  Total lines:       ${chalk.cyan(String(result.totalLines))}`)
  lines.push(`  Code lines:        ${chalk.green(String(result.totalCodeLines))} (${percentageOf(result.totalCodeLines, result.totalLines)})`)
  lines.push(`  Comment lines:     ${chalk.yellow(String(result.totalCommentLines))} (${percentageOf(result.totalCommentLines, result.totalLines)})`)
  lines.push(`  Blank lines:       ${chalk.dim(String(result.totalBlankLines))} (${percentageOf(result.totalBlankLines, result.totalLines)})`)
  lines.push('')

  // ─── Declarations section ─────────────────────────────
  lines.push(chalk.bold('Declarations'))
  lines.push(`  Functions:         ${String(result.totalFunctions)}`)
  lines.push(`  Classes:           ${String(result.totalClasses)}`)
  lines.push(`  Imports:           ${String(result.totalImports)}`)
  lines.push(`  Exports:           ${String(result.totalExports)}`)
  lines.push('')

  // ─── Language distribution ────────────────────────────
  lines.push(chalk.bold('Language Distribution'))
  const sortedLangs = sortLanguages(result.languages, sort)
  for (const lang of sortedLangs) {
    const bar = formatLanguageBar(lang.percentage)
    lines.push(`  ${padRight(lang.language, 14)} ${bar} ${padLeft(String(lang.percentage) + '%', 6)} (${lang.files} files, ${lang.codeLines} code)`)
  }
  lines.push('')

  // ─── Maintainability ─────────────────────────────────
  lines.push(chalk.bold('Maintainability'))
  const mi = result.maintainability
  lines.push(`  Grade:             ${formatGrade(mi.grade)} (${mi.index}/100)`)
  lines.push(`  Avg lines/file:    ${mi.avgLinesPerFile}`)
  lines.push(`  Avg func length:   ${mi.avgFunctionLength}`)
  lines.push(`  Comment ratio:     ${(mi.commentRatio * 100).toFixed(1)}%`)
  lines.push(`  Export ratio:      ${(mi.exportRatio * 100).toFixed(1)}%`)
  lines.push('')

  // ─── Largest files ───────────────────────────────────
  if (result.largestFiles.length > 0) {
    lines.push(chalk.bold('Largest Files'))
    for (const file of result.largestFiles) {
      lines.push(`  ${chalk.cyan(file.filePath)} (${file.language}): ${file.totalLines} lines, ${file.functions} functions, ${file.classes} classes`)
    }
    lines.push('')
  }

  // ─── Smallest files ──────────────────────────────────
  if (result.smallestFiles.length > 0) {
    lines.push(chalk.bold('Smallest Files'))
    for (const file of result.smallestFiles) {
      lines.push(`  ${chalk.cyan(file.filePath)} (${file.language}): ${file.totalLines} lines`)
    }
    lines.push('')
  }

  // ─── Detailed per-file breakdown ─────────────────────
  if (detailed && result.fileStats.length > 0) {
    lines.push(chalk.bold('Per-File Breakdown'))

    const sortedFiles = sortFileStats(result.fileStats, sort)
    for (const file of sortedFiles) {
      lines.push(`  ${chalk.cyan(file.filePath)}`)
      lines.push(`    Language: ${file.language}  Lines: ${file.totalLines} (${file.codeLines} code, ${file.commentLines} comment, ${file.blankLines} blank)`)
      lines.push(`    Functions: ${file.functions}  Classes: ${file.classes}  Imports: ${file.imports}  Exports: ${file.exports}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format stats as JSON string.
 * @example
 * const json = formatStatsJson(result)
 */
export function formatStatsJson(result: StatsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Internal helpers ───────────────────────────────────

function percentageOf(part: number, whole: number): string {
  if (whole === 0) return '0.0%'
  return ((part / whole) * 100).toFixed(1) + '%'
}

type SortKey = 'classes' | 'files' | 'functions' | 'language' | 'lines'

function sortLanguages(languages: StatsResult['languages'], sortBy: string): StatsResult['languages'] {
  const key: SortKey = sortBy as SortKey
  const sorted = [...languages]
  sorted.sort((a, b) => {
    switch (key) {
      case 'files': return b.files - a.files
      case 'functions': return b.functions - a.functions
      case 'classes': return b.classes - a.classes
      case 'language': return a.language.localeCompare(b.language)
      case 'lines':
      default: return b.codeLines - a.codeLines
    }
  })
  return sorted
}

function sortFileStats(files: FileStats[], sortBy: string): FileStats[] {
  const key: SortKey = sortBy as SortKey
  return [...files].sort((a, b) => {
    switch (key) {
      case 'files': return b.totalLines - a.totalLines
      case 'functions': return b.functions - a.functions
      case 'classes': return b.classes - a.classes
      case 'language': return a.language.localeCompare(b.language)
      case 'lines':
      default: return b.totalLines - a.totalLines
    }
  })
}

// ─── CSV / Table / Output ──────────────────────────────

type StatsFile = { name: string; loc: number; complexity: number; size: number; type: string }
type StatsSummary = {
  files: number; loc: number; functions: number; classes: number; interfaces: number;
  enums: number; methods: number; typeAliases: number; complexity: number;
  blankLines: number; commentLines: number; averageComplexity: number; averageLoc: number
}
type StatsInput = {
  files?: StatsFile[]
  fileTypes?: Record<string, number>
  summary?: StatsSummary
}

function getStatsFiles(stats: StatsInput): StatsFile[] {
  return (stats as Record<string, unknown>).files as StatsFile[] ?? []
}

function getStatsSummary(stats: StatsInput): StatsSummary {
  return ((stats as Record<string, unknown>).summary as StatsSummary) ?? {
    files: 0, loc: 0, functions: 0, classes: 0, interfaces: 0,
    enums: 0, methods: 0, typeAliases: 0, complexity: 0,
    blankLines: 0, commentLines: 0, averageComplexity: 0, averageLoc: 0,
  }
}

function getFileTypes(stats: StatsInput): Record<string, number> {
  return ((stats as Record<string, unknown>).fileTypes as Record<string, number>) ?? {}
}

export function formatCsv(stats: StatsInput): string {
  const files = getStatsFiles(stats)
  const lines: string[] = []
  lines.push('File,LOC,Complexity,Size (bytes),Type')
  for (const f of files) {
    lines.push(`${f.name},${f.loc},${f.complexity},${f.size},${f.type}`)
  }
  return lines.join('\n')
}

const formatNumber = (n: number): string => n.toLocaleString('en-US')

export function formatTable(stats: StatsInput, top: number): string {
  const files = getStatsFiles(stats)
  const summary = getStatsSummary(stats)
  const fileTypes = getFileTypes(stats)

  const lines: string[] = []

  lines.push(chalk.bold('\n📊 Codebase Statistics\n'))

  lines.push(chalk.dim('Summary:'))
  lines.push(`  Total files: ${summary.files}`)
  lines.push(`  Lines of code: ${formatNumber(summary.loc)}`)
  lines.push(`  Total complexity: ${formatNumber(summary.complexity)}`)
  lines.push(`  Blank lines: ${formatNumber(summary.blankLines)}`)
  lines.push(`  Comment lines: ${formatNumber(summary.commentLines)}`)
  lines.push('')

  lines.push(chalk.dim('Code structures:'))
  lines.push(`  Classes: ${summary.classes}`)
  lines.push(`  Functions: ${summary.functions}`)
  lines.push(`  Methods: ${summary.methods}`)
  lines.push(`  Interfaces: ${summary.interfaces}`)
  lines.push(`  Type aliases: ${summary.typeAliases}`)
  lines.push(`  Enums: ${summary.enums}`)
  lines.push('')

  lines.push(chalk.dim('File Types:'))
  for (const [ext, count] of Object.entries(fileTypes)) {
    lines.push(`  ${ext}: ${count}`)
  }
  lines.push('')

  lines.push(chalk.dim(`Top ${top} Largest Files:`))
  const topN = files.slice(0, top)
  for (const f of topN) {
    lines.push(`  ${f.name}`)
    lines.push(`    LOC: ${f.loc}, Complexity: ${f.complexity}, Size: ${f.size} bytes`)
  }

  return lines.join('\n')
}

export function formatOutput(stats: StatsInput, format: string, top: number): string {
  if (format === 'csv') return formatCsv(stats)
  return formatTable(stats, top)
}
