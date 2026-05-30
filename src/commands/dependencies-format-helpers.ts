import chalk from 'chalk'

import type { DependenciesResult, DependencyTree } from './dependencies-helpers.js'
import { categorizeVersionType, type SemverRange } from './dependencies-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

function colorizeConstraint(parsedRange: SemverRange, value: string): string {
  const vType = categorizeVersionType(parsedRange)
  switch (vType) {
    case 'exact':
      return chalk.green(value)
    case 'caret':
      return chalk.blue(value)
    case 'tilde':
      return chalk.yellow(value)
    case 'any':
      return chalk.red(value)
    case 'range':
      return chalk.magenta(value)
    default:
      return value
  }
}

/**
 * Format dependency analysis as a colorized table.
 * @example
 * formatDependenciesTable(result, false, 3)
 */
export function formatDependenciesTable(
  result: DependenciesResult,
  verbose: boolean,
  depth: number,
): string {
  const { dependencies, summary } = result
  const lines: string[] = [chalk.bold('\n📦 NPM Dependency Analysis'), '']

  // Summary section
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Dependencies:      ${chalk.cyan(String(summary.totalDeps))}`)
  lines.push(`  Dev Dependencies:   ${chalk.cyan(String(summary.totalDevDeps))}`)
  lines.push(`  Peer Dependencies:  ${chalk.cyan(String(summary.totalPeerDeps))}`)
  lines.push(`  Optional Deps:     ${chalk.cyan(String(summary.totalOptionalDeps))}`)
  lines.push(`  Max Depth:         ${chalk.cyan(String(summary.maxDepth))}`)

  if (summary.versionTypes.length > 0) {
    const vtStr = summary.versionTypes
      .map((vt) => `${vt.type}: ${vt.count}`)
      .join(', ')
    lines.push(`  Constraints:       ${chalk.dim(vtStr)}`)
  }

  lines.push(`  Health Score:      ${formatHealthBar(summary.healthScore)} ${String(summary.healthScore)}/100`)

  // Dependencies table
  if (dependencies.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Dependencies:'))

    const colWidths = {
      constraint: Math.max(10, ...dependencies.map((d) => categorizeVersionType(d.parsedRange).length)),
      name: Math.max(12, ...dependencies.map((d) => d.name.length)),
      type: Math.max(14, ...dependencies.map((d) => d.type.length)),
      version: Math.max(10, ...dependencies.map((d) => d.version.length)),
    }

    const header =
      chalk.cyan(padRight('Name', colWidths.name)) +
      '  ' +
      chalk.cyan(padRight('Version', colWidths.version)) +
      '  ' +
      chalk.cyan(padRight('Type', colWidths.type)) +
      '  ' +
      chalk.cyan(padRight('Constraint', colWidths.constraint))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const dep of dependencies) {
      const constraint = categorizeVersionType(dep.parsedRange)
      const row =
        padRight(dep.name, colWidths.name) +
        '  ' +
        colorizeConstraint(dep.parsedRange, padRight(dep.version, colWidths.version)) +
        '  ' +
        padRight(dep.type, colWidths.type) +
        '  ' +
        colorizeConstraint(dep.parsedRange, padRight(constraint, colWidths.constraint))
      lines.push(row)
    }
  }

  // Verbose: show dependency tree
  if (verbose) {
    const treeStr = formatDependencyTree(result.tree, depth)
    if (treeStr) {
      lines.push('')
      lines.push(chalk.bold('Dependency Tree:'))
      lines.push(treeStr)
    }
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
 * Format dependency analysis as CSV.
 * @example
 * formatDependenciesCsv(result)
 */
export function formatDependenciesCsv(result: DependenciesResult): string {
  const headers = ['Name', 'Version', 'Type', 'Constraint']
  const rows: string[] = [headers.join(',')]

  for (const dep of result.dependencies) {
    const constraint = categorizeVersionType(dep.parsedRange)
    rows.push(
      [
        escapeCsv(dep.name),
        escapeCsv(dep.version),
        escapeCsv(dep.type),
        escapeCsv(constraint),
      ].join(','),
    )
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format dependency analysis as pretty-printed JSON.
 * @example
 * formatDependenciesJson(result)
 */
export function formatDependenciesJson(result: DependenciesResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Health bar ─────────────────────────────────────────

/**
 * Render an inline health bar using block characters, color-coded by score.
 * @example
 * formatHealthBar(85) // '████████████████████░' in green
 */
export function formatHealthBar(score: number): string {
  const total = 20
  const filled = Math.round(score / 5)
  const empty = total - filled

  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)

  if (score >= 80) return chalk.green(bar)
  if (score >= 50) return chalk.yellow(bar)
  return chalk.red(bar)
}

// ─── Dependency tree formatting ──────────────────────────

/**
 * Recursively format a dependency tree as an indented string.
 * @example
 * formatDependencyTree(tree, 3)
 */
export function formatDependencyTree(
  tree: DependencyTree,
  maxDepth: number,
  indent: string = '',
): string {
  if (tree.depth > maxDepth) return ''

  const lines: string[] = []
  const label = `${tree.name}@${tree.version}`
  lines.push(`${indent}${chalk.cyan(label)}`)

  for (const child of tree.dependencies) {
    if (child.depth <= maxDepth) {
      const childStr = formatDependencyTree(child, maxDepth, indent + '  ')
      if (childStr) lines.push(childStr)
    }
  }

  return lines.join('\n')
}
