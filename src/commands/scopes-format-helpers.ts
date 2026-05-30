import chalk from 'chalk'

import type { ScopesResult } from './scopes-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Helpers ─────────────────────────────────────────────

// ─── Score formatting ────────────────────────────────────

/**
 * Format a score with color based on type.
 * Coupling: 0-30=green, 31-60=yellow, 61-100=red (lower is better).
 * Cohesion: 70-100=green, 40-69=yellow, 0-39=red (higher is better).
 * Instability: 0-0.3=green, 0.31-0.7=yellow, 0.71-1=red (balanced is preferred).
 */
export function formatScore(value: number, type: 'coupling' | 'cohesion' | 'instability'): string {
  if (type === 'coupling') {
    if (value <= 30) return chalk.green(String(value))
    if (value <= 60) return chalk.yellow(String(value))
    return chalk.red(String(value))
  }

  if (type === 'cohesion') {
    if (value >= 70) return chalk.green(String(value))
    if (value >= 40) return chalk.yellow(String(value))
    return chalk.red(String(value))
  }

  // instability
  if (value <= 0.3) return chalk.green(String(value))
  if (value <= 0.7) return chalk.yellow(String(value))
  return chalk.red(String(value))
}

// ─── Table formatting ────────────────────────────────────

export function formatScopesTable(result: ScopesResult, verbose: boolean): string {
  const { modules, stats, dependencyMatrix } = result
  const lines: string[] = [chalk.bold('\n🔍 Module Scope Analysis'), '']

  // Stats overview
  lines.push(chalk.bold('Overview:'))
  lines.push(`  Modules: ${stats.totalModules}`)
  lines.push(`  Avg Coupling:     ${formatScore(stats.avgCoupling, 'coupling')}`)
  lines.push(`  Avg Cohesion:     ${formatScore(stats.avgCohesion, 'cohesion')}`)
  lines.push(`  Avg Instability:  ${formatScore(stats.avgInstability, 'instability')}`)
  lines.push('')

  if (modules.length === 0) {
    lines.push(chalk.dim('No modules found.'))
    return lines.join('\n')
  }

  // Module table
  const colWidths = {
    cohesion: Math.max(9, ...modules.map((m) => String(m.cohesionScore).length)),
    coupling: Math.max(9, ...modules.map((m) => String(m.couplingScore).length)),
    deps: Math.max(4, ...modules.map((m) => String(m.dependencies.length).length)),
    files: Math.max(5, ...modules.map((m) => String(m.files).length)),
    instability: Math.max(12, ...modules.map((m) => String(m.instability).length)),
    module: Math.max(6, ...modules.map((m) => m.path.length)),
  }

  const header =
    chalk.cyan(padRight('Module', colWidths.module)) +
    '  ' +
    chalk.cyan(padLeft('Files', colWidths.files)) +
    '  ' +
    chalk.cyan(padLeft('Coupling', colWidths.coupling)) +
    '  ' +
    chalk.cyan(padLeft('Cohesion', colWidths.cohesion)) +
    '  ' +
    chalk.cyan(padLeft('Instability', colWidths.instability)) +
    '  ' +
    chalk.cyan(padLeft('Deps', colWidths.deps))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const mod of modules) {
    const row =
      padRight(mod.path, colWidths.module) +
      '  ' +
      padLeft(String(mod.files), colWidths.files) +
      '  ' +
      padLeft(formatScore(mod.couplingScore, 'coupling'), colWidths.coupling) +
      '  ' +
      padLeft(formatScore(mod.cohesionScore, 'cohesion'), colWidths.cohesion) +
      '  ' +
      padLeft(formatScore(mod.instability, 'instability'), colWidths.instability) +
      '  ' +
      padLeft(String(mod.dependencies.length), colWidths.deps)
    lines.push(row)
  }

  // Circular dependencies
  if (stats.circularDependencies.length > 0) {
    lines.push('')
    lines.push(chalk.bold(chalk.red('⚠ Circular Dependencies:')))
    for (const cd of stats.circularDependencies) {
      const severityLabel = cd.severity === 'high'
        ? chalk.red('[HIGH]')
        : cd.severity === 'medium'
          ? chalk.yellow('[MED]')
          : chalk.dim('[LOW]')
      lines.push(`  ${severityLabel} ${cd.cycle.join(' → ')}`)
    }
  }

  // Layer violations
  if (stats.layerViolations.length > 0) {
    lines.push('')
    lines.push(chalk.bold(chalk.yellow('⚠ Layer Violations:')))
    for (const lv of stats.layerViolations) {
      const severityLabel = lv.severity === 'error' ? chalk.red('[ERROR]') : chalk.yellow('[WARN]')
      lines.push(`  ${severityLabel} ${lv.from} → ${lv.to}`)
      lines.push(`    ${chalk.dim(lv.rule)}`)
    }
  }

  // Highly coupled warning
  if (stats.highlyCoupledModules.length > 0) {
    lines.push('')
    lines.push(chalk.bold(chalk.yellow(`⚠ ${stats.highlyCoupledModules.length} highly coupled module(s) (coupling > 70):`)))
    for (const mod of stats.highlyCoupledModules) {
      lines.push(`  ${chalk.red(mod.path)} (coupling: ${mod.couplingScore})`)
    }
  }

  // Isolated modules
  if (stats.isolatedModules.length > 0) {
    lines.push('')
    lines.push(chalk.bold(chalk.blue(`ℹ ${stats.isolatedModules.length} isolated module(s) (no external imports):`)))
    for (const mod of stats.isolatedModules) {
      lines.push(`  ${chalk.blue(mod.path)}`)
    }
  }

  // Verbose: dependency matrix
  if (verbose) {
    lines.push('')
    lines.push(chalk.bold('Dependency Matrix:'))
    const allModules = Object.keys(dependencyMatrix).sort()
    for (const from of allModules) {
      const targets = dependencyMatrix[from]
      if (targets && Object.keys(targets).length > 0) {
        const deps = Object.entries(targets)
          .map(([to, count]) => `${to} (${count})`)
          .join(', ')
        lines.push(`  ${chalk.cyan(from)} → ${deps}`)
      } else {
        lines.push(`  ${chalk.cyan(from)} → ${chalk.dim('(no dependencies)')}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ─────────────────────────────────────

export function formatScopesJson(result: ScopesResult): string {
  return JSON.stringify(result, null, 2)
}
