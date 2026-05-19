import chalk from 'chalk'

import type { ConfigFile, ConfigFilesResult } from './configfiles-helpers.js'

// ─── Utility ────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Status formatting ──────────────────────────────────

/**
 * Returns an icon + colored name for a config file's status.
 *
 * @example
 * ```ts
 * formatConfigStatus(file) // '✓ tsconfig.json' (green)
 * ```
 */
export function formatConfigStatus(file: ConfigFile): string {
  const icon = file.isValid === true ? chalk.green('✓') : file.isValid === false ? chalk.red('✗') : chalk.dim('·')
  return `${icon} ${chalk.cyan(file.name)}`
}

/**
 * Returns a colored ASCII coverage bar.
 *
 * @example
 * ```ts
 * formatCoverage(75) // '[████████████████░░░░░] 75%'
 * ```
 */
export function formatCoverage(percentage: number): string {
  const filled = Math.round((percentage / 100) * 20)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  const color = percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
  return color(`[${bar}] ${percentage}%`)
}

// ─── Table formatting ───────────────────────────────────

/**
 * Formats config files analysis result as a table.
 *
 * @example
 * ```ts
 * formatConfigFilesTable(result, false)
 * // Returns formatted string with categories, coverage, etc.
 * ```
 */
export function formatConfigFilesTable(result: ConfigFilesResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📋 Config Files Report'), '']

  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total config files: ${chalk.white(String(result.totalFiles))}`)
  lines.push(`  Total size: ${chalk.white(formatBytes(result.totalSize))}`)
  lines.push(`  Coverage: ${formatCoverage(result.coverage)}`)

  const errorCount = result.issues.filter((i) => i.severity === 'error').length
  const warningCount = result.issues.filter((i) => i.severity === 'warning').length
  const infoCount = result.issues.filter((i) => i.severity === 'info').length

  if (result.issues.length > 0) {
    lines.push(
      `  Issues: ${chalk.red(`${errorCount} errors`)}, ${chalk.yellow(`${warningCount} warnings`)}, ${chalk.blue(`${infoCount} info`)}`,
    )
  } else {
    lines.push(`  Issues: ${chalk.green('None')}`)
  }

  if (result.categories.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Categories:'))

    const nameWidth = Math.max(20, ...result.files.map((f) => f.name.length))
    const typeWidth = Math.max(10, ...result.categories.map((c) => c.label.length))

    for (const category of result.categories) {
      lines.push('')
      lines.push(`  ${chalk.bold(category.label)} ${chalk.dim(`(${category.files.length} file${category.files.length !== 1 ? 's' : ''})`)}`)

      for (const file of category.files) {
        const status = formatConfigStatus(file)
        const sizeStr = chalk.dim(formatBytes(file.size))
        const formatStr = chalk.dim(`[${file.format}]`)
        lines.push(`    ${status}  ${formatStr}  ${sizeStr}`)
      }
    }
  }

  if (result.missingConfigs.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Missing Configs:'))
    for (const missing of result.missingConfigs) {
      lines.push(`  ${chalk.yellow('⚠')} ${chalk.dim(missing)}`)
    }
  }

  if (result.issues.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Issues:'))
    for (const issue of result.issues) {
      const icon = issue.severity === 'error' ? chalk.red('✗') : issue.severity === 'warning' ? chalk.yellow('⚠') : chalk.blue('ℹ')
      lines.push(`  ${icon} ${issue.message}`)
    }
  }

  if (verbose && result.files.length > 0) {
    lines.push('')
    lines.push(chalk.bold('File Details:'))
    for (const file of result.files) {
      lines.push('')
      lines.push(`  ${chalk.bold(file.name)} (${file.format})`)
      lines.push(`    Path: ${file.relativePath}`)
      lines.push(`    Type: ${file.type}`)
      lines.push(`    Size: ${formatBytes(file.size)}`)
      lines.push(`    Modified: ${file.lastModified}`)
      lines.push(`    Valid: ${file.isValid === null ? 'not checked' : file.isValid ? 'yes' : 'no'}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Formats config files analysis result as JSON.
 *
 * @example
 * ```ts
 * formatConfigFilesJson(result)
 * // Returns JSON string of the result
 * ```
 */
export function formatConfigFilesJson(result: ConfigFilesResult): string {
  return JSON.stringify(result, null, 2)
}
