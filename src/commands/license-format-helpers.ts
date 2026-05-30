import chalk from 'chalk'

import type { LicenseResult } from './license-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return chalk.green(String(confidence))
  if (confidence >= 0.7) return chalk.yellow(String(confidence))
  return chalk.red(String(confidence))
}

function formatIssueType(type: string): string {
  switch (type) {
    case 'missing':
      return chalk.red('MISSING')
    case 'unknown':
      return chalk.yellow('UNKNOWN')
    case 'copyleft':
      return chalk.magenta('COPYLEFT')
    case 'incompatible':
      return chalk.red('INCOMPAT')
    default:
      return type
  }
}

/**
 * Format license result as a colorized table for terminal output.
 *
 * @example
 * ```ts
 * const output = formatLicenseTable(result, true)
 * console.log(output)
 * ```
 *
 * @param result - License analysis result
 * @param verbose - Whether to show detailed output
 * @returns Formatted table string
 */
export function formatLicenseTable(result: LicenseResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n⚖️  License Report'), '']

  // Project license section
  const { projectLicense } = result
  lines.push(chalk.bold('Project License:'))

  if (projectLicense.packageJsonLicense) {
    lines.push(`  package.json: ${chalk.green(projectLicense.packageJsonLicense)}`)
  }

  if (projectLicense.detected.length > 0) {
    lines.push('  Detected:')
    for (const det of projectLicense.detected) {
      lines.push(`    ${chalk.cyan(det.spdxId)} (${det.name}) - confidence: ${formatConfidence(det.confidence)}`)
    }
  } else if (!projectLicense.packageJsonLicense) {
    lines.push(`  ${chalk.yellow('No license detected')}`)
  }

  if (projectLicense.licenseFiles.length > 0) {
    lines.push('  License files:')
    for (const file of projectLicense.licenseFiles) {
      lines.push(`    ${chalk.dim(file.path)}`)
    }
  } else {
    lines.push(`  ${chalk.dim('No license files found')}`)
  }

  // Dependency section
  if (result.dependencies.length > 0) {
    lines.push('')
    lines.push(chalk.bold(`Dependencies (${result.dependencies.length}):`))

    const nameWidth = Math.max(15, ...result.dependencies.map((d) => d.name.length))
    const verWidth = Math.max(7, ...result.dependencies.map((d) => d.version.length))
    const licWidth = Math.max(10, ...result.dependencies.map((d) => d.license.length))

    const header =
      chalk.cyan(padRight('Package', nameWidth)) +
      '  ' +
      chalk.cyan(padLeft('Version', verWidth)) +
      '  ' +
      chalk.cyan(padLeft('License', licWidth)) +
      '  ' +
      chalk.cyan('Direct')

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const dep of result.dependencies) {
      const licColor = dep.license === 'UNKNOWN' ? chalk.red : chalk.white
      const row =
        padRight(dep.name, nameWidth) +
        '  ' +
        padLeft(dep.version, verWidth) +
        '  ' +
        padLeft(licColor(dep.license), licWidth) +
        '  ' +
        (dep.isDirect ? chalk.green('✓') : chalk.dim('✗'))

      lines.push(row)
    }

    if (verbose) {
      lines.push('')
      for (const dep of result.dependencies) {
        if (dep.licenseFile) {
          lines.push(chalk.dim(`  ${dep.name}: ${dep.licenseFile}`))
        }
      }
    }
  }

  // Issues section
  if (result.issues.length > 0) {
    lines.push('')
    lines.push(chalk.bold(`Issues (${result.issues.length}):`))

    for (const issue of result.issues) {
      lines.push(`  ${formatIssueType(issue.type)} ${chalk.bold(issue.dependency)}: ${issue.description}`)
    }
  }

  // Summary
  lines.push('')
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total dependencies: ${result.summary.totalDeps}`)

  if (result.summary.licenseBreakdown.length > 0) {
    lines.push('  License breakdown:')
    for (const entry of result.summary.licenseBreakdown) {
      const licColor = entry.license === 'UNKNOWN' ? chalk.red : chalk.cyan
      lines.push(`    ${licColor(entry.license)}: ${entry.count}`)
    }
  }

  if (result.summary.issuesFound > 0) {
    lines.push(`  Issues found: ${chalk.red(String(result.summary.issuesFound))}`)
  } else if (result.dependencies.length > 0) {
    lines.push(`  Issues found: ${chalk.green('0')}`)
  }

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format license result as CSV.
 *
 * @example
 * ```ts
 * const csv = formatLicenseCsv(result)
 * ```
 *
 * @param result - License analysis result
 * @returns CSV formatted string
 */
export function formatLicenseCsv(result: LicenseResult): string {
  const headers = ['Section', 'Name', 'Value', 'Extra']
  const rows: string[] = [headers.join(',')]

  // Project license rows
  if (result.projectLicense.packageJsonLicense) {
    rows.push(
      ['project', 'package.json', escapeCsv(result.projectLicense.packageJsonLicense), ''].join(','),
    )
  }

  for (const det of result.projectLicense.detected) {
    rows.push(['project', escapeCsv(det.spdxId), escapeCsv(det.name), String(det.confidence)].join(','))
  }

  for (const file of result.projectLicense.licenseFiles) {
    rows.push(['license-file', escapeCsv(file.path), '', ''].join(','))
  }

  // Dependency rows
  for (const dep of result.dependencies) {
    rows.push(
      [
        'dependency',
        escapeCsv(dep.name),
        escapeCsv(dep.license),
        `${dep.version},${dep.isDirect ? 'direct' : 'transitive'}`,
      ].join(','),
    )
  }

  // Issue rows
  for (const issue of result.issues) {
    rows.push(['issue', escapeCsv(issue.dependency), issue.type, escapeCsv(issue.description)].join(','))
  }

  // Summary rows
  for (const entry of result.summary.licenseBreakdown) {
    rows.push(['summary', escapeCsv(entry.license), String(entry.count), ''].join(','))
  }

  rows.push(['summary', 'totalDeps', String(result.summary.totalDeps), ''].join(','))
  rows.push(['summary', 'issuesFound', String(result.summary.issuesFound), ''].join(','))

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format license result as pretty-printed JSON.
 *
 * @example
 * ```ts
 * const json = formatLicenseJson(result)
 * ```
 *
 * @param result - License analysis result
 * @returns JSON formatted string
 */
export function formatLicenseJson(result: LicenseResult): string {
  return JSON.stringify(result, null, 2)
}
