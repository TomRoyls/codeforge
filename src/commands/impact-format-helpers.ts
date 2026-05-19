import chalk from 'chalk'

import type { ImpactChain, ImpactNode, ImpactResult } from './impact-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(level: 'low' | 'medium' | 'high'): (s: string) => string {
  switch (level) {
    case 'high': return chalk.red
    case 'medium': return chalk.yellow
    case 'low': return chalk.green
  }
}

function effortColor(effort: string): (s: string) => string {
  switch (effort) {
    case 'critical': return chalk.bgRed.white
    case 'high': return chalk.red
    case 'medium': return chalk.yellow
    default: return chalk.green
  }
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length)
}

// ─── ASCII Impact Tree ────────────────────────────────────────────────────────

/**
 * Render dependency chains as ASCII tree.
 *
 * @example
 * formatImpactTree(chains) // '├── a.ts\n│   └── b.ts'
 */
export function formatImpactTree(chains: ImpactChain[]): string {
  if (chains.length === 0) return chalk.gray('  No dependency chains found.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Impact Chains'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const chain of chains.slice(0, 15)) {
    const indent = '  '
    for (let i = 0; i < chain.path.length; i++) {
      const isLast = i === chain.path.length - 1
      const connector = i === 0 ? '' : isLast ? '└── ' : '├── '
      const prefix = i === 0 ? indent : indent + '  '.repeat(i - 1) + (i > 1 ? '  ' : '')
      const color = i === 0 ? chalk.bold.cyan : riskColor(i === 1 ? 'medium' : 'low')
      lines.push(`${prefix}${connector}${color(chain.path[i]!)}`)
    }
    if (chains.indexOf(chain) < chains.length - 1 && chains.length > 1) {
      lines.push('')
    }
  }

  if (chains.length > 15) {
    lines.push(`  ${chalk.gray(`... and ${chains.length - 15} more chains`)}`)
  }

  return lines.join('\n')
}

// ─── Direct Dependents Table ──────────────────────────────────────────────────

/**
 * Format direct dependents as a table.
 *
 * @example
 * formatDirectDependents(nodes) // 'File              Imports  Risk  ...'
 */
export function formatDirectDependents(nodes: ImpactNode[]): string {
  if (nodes.length === 0) return chalk.gray('\n  No direct dependents found.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Direct Dependents'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))
  lines.push(`  ${chalk.bold(padRight('File', 30))} ${chalk.bold(padRight('Imports', 8))} ${chalk.bold(padRight('Risk', 8))} ${chalk.bold('Reason')}`)

  for (const node of nodes) {
    const file = node.file.length > 28 ? '...' + node.file.slice(-26) : node.file
    lines.push(`  ${padRight(file, 30)} ${padRight(String(node.totalImports), 8)} ${riskColor(node.riskLevel)(padRight(node.riskLevel, 8))} ${chalk.gray(node.reason)}`)
  }

  return lines.join('\n')
}

// ─── Blast Radius Gauge ───────────────────────────────────────────────────────

/**
 * Render blast radius as a visual gauge.
 *
 * @example
 * formatBlastRadiusGauge(5) // '█████░░░░░░░░░░░░░░░ 5 files'
 */
export function formatBlastRadiusGauge(blastRadius: number): string {
  const width = 25
  const filled = Math.min(width, blastRadius)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const colorFn = blastRadius > 10 ? chalk.red : blastRadius > 5 ? chalk.yellow : chalk.green
  return `  ${colorFn(bar)} ${chalk.bold(String(blastRadius))} files`
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete impact result as table output.
 *
 * @example
 * formatImpactTable(result, false) // full dashboard output
 */
export function formatImpactTable(result: ImpactResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold(`\n  Impact Analysis: ${chalk.cyan(result.target)}`))
  sections.push(chalk.gray('  ─────────────────────────────────────────'))

  sections.push(`  Exports: ${result.exports.length > 0 ? result.exports.slice(0, 8).join(', ') : chalk.gray('none')}`)
  if (result.exports.length > 8) {
    sections.push(`           ${chalk.gray(`... and ${result.exports.length - 8} more`)}`)
  }

  if (result.unusedExports.length > 0) {
    sections.push(`  ${chalk.yellow('Unused')}: ${result.unusedExports.join(', ')}`)
  }

  sections.push(chalk.bold('\n  Blast Radius'))
  sections.push(chalk.gray('  ─────────────────────────────────────────'))
  sections.push(formatBlastRadiusGauge(result.stats.blastRadius))
  sections.push(`  Direct: ${chalk.bold(String(result.stats.directCount))}  Indirect: ${chalk.bold(String(result.stats.indirectCount))}  Max Chain: ${chalk.bold(String(result.stats.maxChainLength))}`)
  sections.push(`  Avg Risk: ${chalk.bold(String(result.stats.averageRiskScore))}  Effort: ${effortColor(result.stats.estimatedEffort)(result.stats.estimatedEffort.toUpperCase())}`)

  sections.push(formatDirectDependents(result.directDependents))

  if (result.indirectDependents.length > 0) {
    sections.push(chalk.bold('\n  Indirect Dependents'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const node of result.indirectDependents.slice(0, 10)) {
      sections.push(`  ${chalk.gray(`(depth ${node.depth})`)} ${padRight(node.file, 30)} ${riskColor(node.riskLevel)(node.riskLevel)}`)
    }
    if (result.indirectDependents.length > 10) {
      sections.push(`  ${chalk.gray(`... and ${result.indirectDependents.length - 10} more`)}`)
    }
  }

  if (verbose || result.chains.length <= 10) {
    sections.push(formatImpactTree(result.chains))
  }

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format impact result as JSON.
 *
 * @example
 * formatImpactJson(result) // '{"target":"src/core.ts",...}'
 */
export function formatImpactJson(result: ImpactResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format impact result as CSV.
 *
 * @example
 * formatImpactCsv(result) // 'file,depth,riskLevel,...'
 */
export function formatImpactCsv(result: ImpactResult): string {
  const lines: string[] = ['type,file,depth,riskLevel,imports']

  for (const d of result.directDependents) {
    lines.push(`direct,${d.file},${d.depth},${d.riskLevel},${d.totalImports}`)
  }
  for (const d of result.indirectDependents) {
    lines.push(`indirect,${d.file},${d.depth},${d.riskLevel},${d.totalImports}`)
  }

  lines.push(`stat,blastRadius,${result.stats.blastRadius},,`)
  lines.push(`stat,directCount,${result.stats.directCount},,`)
  lines.push(`stat,effort,${result.stats.estimatedEffort},,`)

  return lines.join('\n')
}
