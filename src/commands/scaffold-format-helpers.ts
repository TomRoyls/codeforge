import chalk from 'chalk'

import type { DirectoryStructure, ProjectFile, ScaffoldResult, ScaffoldStats, StructureCheck } from './scaffold-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────



function statusIcon(status: string): string {
  if (status === 'pass') return chalk.green('✔')
  if (status === 'warning') return chalk.yellow('⚠')
  return chalk.red('✖')
}

function gradeColor(grade: string): (s: string) => string {
  switch (grade) {
    case 'A': return chalk.green
    case 'B': return chalk.rgb(100, 200, 100)
    case 'C': return chalk.yellow
    case 'D': return chalk.rgb(255, 165, 0)
    default: return chalk.red
  }
}

// ─── File Checklist ───────────────────────────────────────────────────────────

/**
 * Format essential files as a checklist.
 *
 * @example
 * formatFileChecklist(files) // '✔ README.md  ✖ LICENSE'
 */
export function formatFileChecklist(files: ProjectFile[]): string {
  if (files.length === 0) return chalk.gray('  No files checked.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Essential Files'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  for (const f of files) {
    const icon = f.exists ? chalk.green('✔') : f.required ? chalk.red('✖') : chalk.yellow('○')
    const catLabel = f.category === 'essential' ? chalk.red('*') : f.category === 'recommended' ? chalk.yellow('+') : chalk.gray(' ')
    const name = f.exists ? chalk.bold(f.path) : chalk.gray(f.path)
    lines.push(`  ${icon} ${catLabel} ${padRight(name, 25)} ${chalk.gray(f.description)}`)
  }

  return lines.join('\n')
}

// ─── Directory Tree ───────────────────────────────────────────────────────────

/**
 * Format directory structure as ASCII tree.
 *
 * @example
 * formatDirectoryTree(structure) // 'src/ (source) [10 files]'
 */
export function formatDirectoryTree(structure: DirectoryStructure[]): string {
  if (structure.length === 0) return chalk.gray('  No directories found.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Directory Structure'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  for (const dir of structure.slice(0, 25)) {
    const indent = '  '.repeat(dir.depth)
    const icon = dir.isConventional ? chalk.green('◆') : chalk.gray('◇')
    const purposeStr = dir.purpose !== 'unknown' ? chalk.gray(`(${dir.purpose})`) : ''
    const fileStr = chalk.gray(`${dir.files} files`)
    lines.push(`  ${indent}${icon} ${chalk.bold(dir.path.split('/').at(-1) ?? '')}/ ${purposeStr} ${fileStr}`)
  }

  if (structure.length > 25) {
    lines.push(`  ${chalk.gray(`... and ${structure.length - 25} more directories`)}`)
  }

  return lines.join('\n')
}

// ─── Checks Summary ───────────────────────────────────────────────────────────

/**
 * Format structure checks with pass/fail status.
 *
 * @example
 * formatChecksSummary(checks) // '✔ README exists  ✖ LICENSE is missing'
 */
export function formatChecksSummary(checks: StructureCheck[]): string {
  if (checks.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Structure Checks'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  for (const check of checks) {
    const icon = statusIcon(check.status)
    const catLabel = chalk.gray(`[${check.category}]`)
    lines.push(`  ${icon} ${padRight(check.name, 30)} ${catLabel} ${chalk.gray(check.message)}`)
  }

  return lines.join('\n')
}

// ─── Health Score Gauge ───────────────────────────────────────────────────────

/**
 * Format health score as a visual gauge.
 *
 * @example
 * formatHealthGauge(85, 'B') // 'Health Score: 85/100 [█████████░] Grade: B'
 */
export function formatHealthGauge(stats: ScaffoldStats): string {
  const score = stats.healthScore
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  const gradeStr = gradeColor(stats.grade)(` ${stats.grade} `)

  return `\n  Health Score: ${chalk.bold(String(score))}/100 [${bar}] Grade: ${gradeStr}`
}

// ─── Missing Files ────────────────────────────────────────────────────────────

/**
 * Format missing required files.
 *
 * @example
 * formatMissingFiles(missing) // 'Missing: LICENSE, .gitignore'
 */
export function formatMissingFiles(missing: ProjectFile[]): string {
  if (missing.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Missing Required Files'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────'))

  for (const f of missing) {
    lines.push(`  ${chalk.red('✖')} ${chalk.bold(f.path)} — ${chalk.gray(f.description)}`)
  }

  return lines.join('\n')
}

// ─── Stats Line ───────────────────────────────────────────────────────────────

/**
 * Format stats summary line.
 *
 * @example
 * formatStatsLine(stats) // 'Dirs: 5  Files: 20  Passed: 8  Failed: 2'
 */
export function formatStatsLine(stats: ScaffoldStats): string {
  return chalk.gray(`\n  Dirs: ${stats.directories}  Files: ${stats.files}  Depth: ${stats.maxDepth}  Passed: ${stats.checksPassed}  Failed: ${stats.checksFailed}`)
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete scaffold result as table output.
 *
 * @example
 * formatScaffoldResultTable(result, false) // full dashboard output
 */
export function formatScaffoldResultTable(result: ScaffoldResult, _verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold(`\n  Project: ${chalk.cyan(result.projectName)} (${result.projectType})`))

  sections.push(formatFileChecklist(result.files))
  sections.push(formatChecksSummary(result.checks))
  sections.push(formatDirectoryTree(result.structure))
  sections.push(formatHealthGauge(result.stats))
  sections.push(formatStatsLine(result.stats))

  if (result.missing.length > 0) {
    sections.push(formatMissingFiles(result.missing))
  }

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ────────────────────────────────────────────────────'))
    for (const rec of result.recommendations.slice(0, 10)) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format scaffold result as JSON.
 *
 * @example
 * formatScaffoldJson(result) // '{"projectName":"my-app",...}'
 */
export function formatScaffoldJson(result: ScaffoldResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format scaffold result as CSV.
 *
 * @example
 * formatScaffoldCsv(result) // 'name,status,category'
 */
export function formatScaffoldCsv(result: ScaffoldResult): string {
  const lines: string[] = ['name,status,category,message']

  for (const check of result.checks) {
    const msg = check.message.replace(/"/g, '""')
    lines.push(`"${check.name}",${check.status},${check.category},"${msg}"`)
  }

  return lines.join('\n')
}
