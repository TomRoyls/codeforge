import chalk from 'chalk'

import type { DependencyNode, ImpactAnalysis, ReverseDepsStats } from './reverse-deps-helpers.js'

// ─── Risk Color ─────────────────────────────────────────

/**
 * @example
 * const text = riskLabel('high')
 * console.log(text)
 */
export function riskLabel(level: string): string {
  if (level === 'high') return chalk.red('HIGH')
  if (level === 'medium') return chalk.rgb(255, 165, 0)('MEDIUM')
  return chalk.green('LOW')
}

// ─── Format Risk Label ──────────────────────────────────

/**
 * @example
 * const icon = riskIcon('high')
 * console.log(icon)
 */
export function riskIcon(level: string): string {
  if (level === 'high') return chalk.red('●')
  if (level === 'medium') return chalk.rgb(255, 165, 0)('●')
  return chalk.green('●')
}

// ─── Format Node Tree ───────────────────────────────────

/**
 * @example
 * const text = formatNodeTree(nodes)
 * console.log(text)
 */
export function formatNodeTree(nodes: DependencyNode[]): string {
  if (nodes.length === 0) return chalk.gray('  No dependencies found')

  const lines: string[] = []
  lines.push(chalk.bold('  Dependency Tree'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const node of nodes) {
    const indent = '  '.repeat(node.depth)
    const arrow = node.depth === 0 ? chalk.bold('→') : '↳'
    const deps = node.directDependents.length > 0
      ? chalk.gray(` (${node.directDependents.length} dependents)`)
      : ''
    lines.push(`  ${indent}${arrow} ${chalk.cyan(node.filePath)}${deps}`)
  }

  return lines.join('\n')
}

// ─── Format Affected Table ──────────────────────────────

/**
 * @example
 * const text = formatAffectedTable(analysis)
 * console.log(text)
 */
export function formatAffectedTable(analysis: ImpactAnalysis): string {
  const lines: string[] = []

  if (analysis.directImpact.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Direct Impact'))
    lines.push(chalk.gray('  ──────────────────────────────────────────────'))
    for (const f of analysis.directImpact) {
      lines.push(`  ${chalk.red('→')} ${f}`)
    }
  }

  if (analysis.indirectImpact.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Indirect Impact'))
    lines.push(chalk.gray('  ──────────────────────────────────────────────'))
    for (const f of analysis.indirectImpact) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${f}`)
    }
  }

  if (analysis.directImpact.length === 0 && analysis.indirectImpact.length === 0) {
    lines.push('')
    lines.push(chalk.green('  ✓ No dependents found'))
  }

  return lines.join('\n')
}

// ─── Format Critical Paths ──────────────────────────────

/**
 * @example
 * const text = formatCriticalPaths(paths)
 * console.log(text)
 */
export function formatCriticalPaths(paths: string[][]): string {
  if (paths.length === 0) return ''

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold('  Critical Paths'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (let i = 0; i < paths.length; i++) {
    const chain = (paths[i] ?? []).map((p: string, idx: number) => {
      if (idx === 0) return chalk.bold(p)
      return chalk.cyan(p)
    }).join(` ${chalk.gray('→')} `)
    lines.push(`  ${chalk.gray(`${i + 1}.`)} ${chain}`)
  }

  return lines.join('\n')
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatReverseDepsStats(stats)
 * console.log(text)
 */
export function formatReverseDepsStats(stats: ReverseDepsStats): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Statistics'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))
  lines.push(`  ${chalk.cyan('Total Files:')}         ${stats.totalFiles}`)
  lines.push(`  ${chalk.cyan('Direct Dependents:')}   ${stats.directDependents}`)
  lines.push(`  ${chalk.cyan('Indirect Dependents:')} ${stats.indirectDependents}`)
  lines.push(`  ${chalk.cyan('Max Chain Length:')}    ${stats.maxChainLength}`)
  lines.push(`  ${chalk.cyan('Avg Chain Length:')}    ${stats.avgChainLength}`)

  return lines.join('\n')
}

// ─── Format Table ───────────────────────────────────────

/**
 * @example
 * const text = formatReverseDepsTable(analysis, nodes, stats)
 * console.log(text)
 */
export function formatReverseDepsTable(
  analysis: ImpactAnalysis,
  nodes: DependencyNode[],
  stats: ReverseDepsStats,
): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Reverse Dependency Analysis'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════'))
  parts.push(`  ${chalk.cyan('Target:')}   ${chalk.bold(analysis.targetFile)}`)
  parts.push(`  ${chalk.cyan('Risk:')}     ${riskIcon(analysis.riskLevel)} ${riskLabel(analysis.riskLevel)}`)
  parts.push(`  ${chalk.cyan('Affected:')} ${analysis.totalAffected} files`)
  parts.push(`  ${chalk.cyan('Max Depth:')} ${analysis.maxDepth}`)

  parts.push(formatNodeTree(nodes))
  parts.push(formatAffectedTable(analysis))
  parts.push(formatCriticalPaths(analysis.criticalPaths))
  parts.push(formatReverseDepsStats(stats))

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatReverseDepsJson(analysis, nodes, stats)
 * console.log(json.length)
 */
export function formatReverseDepsJson(
  analysis: ImpactAnalysis,
  nodes: DependencyNode[],
  stats: ReverseDepsStats,
): string {
  return JSON.stringify({ analysis, nodes, stats }, null, 2)
}
