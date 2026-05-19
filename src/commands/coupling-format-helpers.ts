import chalk from 'chalk'

import type { CouplingCluster, CouplingResult, CouplingViolation, ModuleCoupling } from './coupling-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Color-code an instability value.
 *
 * @example
 * instabilityColor(0.1) // green (stable)
 * instabilityColor(0.9) // red (unstable)
 */
export function instabilityColor(value: number): string {
  if (value < 0.3) return chalk.green(String(value))
  if (value < 0.7) return chalk.yellow(String(value))
  return chalk.red(String(value))
}

/**
 * Color-code a distance value.
 *
 * @example
 * distanceColor(0.1) // green (close to ideal)
 * distanceColor(0.8) // red (far from ideal)
 */
export function distanceColor(value: number): string {
  if (value < 0.3) return chalk.green(String(value))
  if (value < 0.6) return chalk.yellow(String(value))
  return chalk.red(String(value))
}

/**
 * Format a severity badge.
 *
 * @example
 * severityBadge('critical') // red '[CRITICAL]'
 * severityBadge('warning') // yellow '[WARNING]'
 */
export function severityBadge(severity: string): string {
  if (severity === 'critical') return chalk.red('[CRITICAL]')
  return chalk.yellow('[WARNING]')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format a module row for the coupling table.
 *
 * @example
 * formatModuleRow(mod) // '  core.ts  8  2  0.20  0.50  0.30'
 */
export function formatModuleRow(mod: ModuleCoupling): string {
  const name = mod.module.padEnd(35)
  const ca = String(mod.afferentCoupling).padStart(3)
  const ce = String(mod.efferentCoupling).padStart(3)
  const instability = instabilityColor(mod.instability)
  const abstractness = String(mod.abstractness).padStart(4)
  const distance = distanceColor(mod.distance)
  return `  ${chalk.dim(name)} ${ca} ${ce}  ${instability}   ${abstractness}  ${distance}`
}

/**
 * Format a violation for display.
 *
 * @example
 * formatViolation(v) // '  [CRITICAL] high-afferent: core.ts ...'
 */
export function formatViolation(v: CouplingViolation): string {
  const badge = severityBadge(v.severity)
  return `  ${badge} ${chalk.bold(v.type)}: ${v.module} — ${v.description}`
}

/**
 * Format a cluster for display.
 *
 * @example
 * formatCluster(cluster) // '  Cluster (3 modules, density: 0.67) ...'
 */
export function formatCluster(cluster: CouplingCluster): string {
  const modules = cluster.modules.slice(0, 5).join(', ')
  const more = cluster.modules.length > 5 ? ` +${cluster.modules.length - 5} more` : ''
  return `  ${chalk.bold(`Cluster (${cluster.size} modules)`)} density: ${cluster.density} avg coupling: ${cluster.averageCoupling}\n    ${chalk.dim(modules)}${more}`
}

/**
 * Format an ASCII scatter plot of abstractness vs instability.
 *
 * @example
 * formatMartinDiagram(modules) // ASCII grid
 */
export function formatMartinDiagram(modules: ModuleCoupling[]): string {
  const width = 30
  const height = 10
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill('·'))
  const labels: string[] = []

  for (const mod of modules) {
    const x = Math.min(Math.round(mod.instability * (width - 1)), width - 1)
    const y = Math.min(Math.round((1 - mod.abstractness) * (height - 1)), height - 1)
    grid[y]![x] = chalk.green('●')
    labels.push(`    ● ${mod.module} (I=${mod.instability}, A=${mod.abstractness})`)
  }

  const lines: string[] = []
  lines.push(`    ${chalk.bold('Abstractness')}`)
  for (let y = 0; y < height; y++) {
    const val = (1 - y / (height - 1)).toFixed(1)
    lines.push(`  ${val} ${grid[y]?.join('') ?? ''}`)
  }
  lines.push(`     ${chalk.dim('0.0').padEnd(15)}1.0`)
  lines.push(`     ${chalk.dim('0.0')}            ${chalk.bold('Instability')}           ${chalk.dim('1.0')}`)

  if (labels.length > 0 && labels.length <= 10) {
    lines.push('')
    for (const label of labels) {
      lines.push(label)
    }
  }

  return lines.join('\n')
}

/**
 * Format the complete coupling analysis as a table.
 *
 * @example
 * formatCouplingTable(result) // full colored terminal output
 */
export function formatCouplingTable(result: CouplingResult, verbose?: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline('Module Coupling Analysis'))
  lines.push('')

  lines.push(chalk.bold('Overview:'))
  lines.push(`  ${chalk.dim('Modules:')}          ${result.stats.totalModules}`)
  lines.push(`  ${chalk.dim('Dependency edges:')} ${result.stats.totalEdges}`)
  lines.push(`  ${chalk.dim('Avg afferent (Ca):')} ${result.stats.averageAfferent}`)
  lines.push(`  ${chalk.dim('Avg efferent (Ce):')} ${result.stats.averageEfferent}`)
  lines.push(`  ${chalk.dim('Avg instability:')}  ${result.stats.averageInstability}`)
  lines.push(`  ${chalk.dim('Most stable:')}      ${result.stats.mostStable}`)
  lines.push(`  ${chalk.dim('Most unstable:')}    ${result.stats.mostUnstable}`)
  lines.push(`  ${chalk.dim('Most depended on:')} ${result.stats.mostDependedUpon}`)
  lines.push(`  ${chalk.dim('Most dependent:')}   ${result.stats.mostDependent}`)
  lines.push('')

  lines.push(chalk.bold('Module Metrics:'))
  lines.push(`  ${chalk.dim('Module'.padEnd(35))}  Ca  Ce   I     A    D`)
  for (const mod of result.modules) {
    lines.push(formatModuleRow(mod))
  }
  lines.push('')

  if (verbose && result.modules.length > 0) {
    lines.push(chalk.bold('Martin Diagram (Abstractness vs Instability):'))
    lines.push(formatMartinDiagram(result.modules))
    lines.push('')
  }

  if (result.clusters.length > 0) {
    lines.push(chalk.bold('Coupling Clusters:'))
    for (const cluster of result.clusters.slice(0, 5)) {
      lines.push(formatCluster(cluster))
    }
    lines.push('')
  }

  if (result.violations.length > 0) {
    lines.push(chalk.bold('Violations:'))
    for (const v of result.violations) {
      lines.push(formatViolation(v))
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format coupling analysis as JSON.
 *
 * @example
 * formatCouplingJson(result) // '{"modules":[...],...}'
 */
export function formatCouplingJson(result: CouplingResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format coupling analysis as CSV.
 *
 * @example
 * formatCouplingCsv(result)
 * // 'module,afferent,efferent,instability,abstractness,distance'
 */
export function formatCouplingCsv(result: CouplingResult): string {
  const header = 'module,afferentCoupling,efferentCoupling,instability,abstractness,distance,totalExports,abstractExports'
  const rows = result.modules.map((m) =>
    `"${m.module}",${m.afferentCoupling},${m.efferentCoupling},${m.instability},${m.abstractness},${m.distance},${m.totalExports},${m.abstractExports}`
  )
  return [header, ...rows].join('\n')
}
