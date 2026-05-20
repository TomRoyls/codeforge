import chalk from 'chalk'

import type {
  FabricScore,
  FileRole,
  Knot,
  KnotSeverity,
  Thread,
  WeavePattern,
  WeaverResult,
  WeaverStats,
} from './weaver-helpers.js'

// ─── Thread Visualization ─────────────────────────────────────────────────────

/**
 * Format threads as ASCII visualization.
 *
 * @example
 * formatThreads(threads)
 */
export function formatThreads(threads: Thread[]): string {
  if (threads.length === 0) return chalk.dim('  No threads detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Threads:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  const shown = threads.slice(0, 20)
  for (const t of shown) {
    const typeIcon = t.type === 'import' ? '→' : t.type === 're-export' ? '↔' : t.type === 'type-import' ? '⇢' : '⟳'
    const strengthBar = '█'.repeat(Math.min(t.strength, 10))
    const strengthColor = t.strength >= 7 ? chalk.rgb(244, 67, 54) : t.strength >= 4 ? chalk.rgb(255, 193, 7) : chalk.dim
    lines.push(`  ${t.from} ${typeIcon} ${t.to} ${strengthColor(strengthBar)} (${t.strength})`)
  }

  if (threads.length > 20) {
    lines.push(chalk.dim(`  ... and ${threads.length - 20} more threads`))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Pattern Classification ───────────────────────────────────────────────────

/**
 * Format weave patterns.
 *
 * @example
 * formatPatterns(patterns)
 */
export function formatPatterns(patterns: WeavePattern[]): string {
  if (patterns.length === 0) return chalk.dim('  No patterns detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Weave Patterns:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (const p of patterns) {
    const healthColor = p.health >= 80 ? chalk.green : p.health >= 50 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    lines.push(`  ${chalk.bold(p.name.padEnd(12))} density: ${p.density.toFixed(2)}  health: ${healthColor(p.health + '/100')}`)
    lines.push(chalk.dim(`    ${p.description}`))
    if (p.files.length > 0) {
      lines.push(chalk.dim(`    Files: ${p.files.slice(0, 5).join(', ')}${p.files.length > 5 ? ` (+${p.files.length - 5})` : ''}`))
    }
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Knot Detection ───────────────────────────────────────────────────────────

/**
 * Format knots with cycle paths.
 *
 * @example
 * formatKnots(knots)
 */
export function formatKnots(knots: Knot[]): string {
  if (knots.length === 0) return chalk.dim('  No circular dependencies — the weave is knot-free!')
  const lines: string[] = []
  lines.push(chalk.bold('  Knots (Circular Dependencies):'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))

  for (let i = 0; i < knots.length; i++) {
    const knot = knots[i]!
    const sevColor = knotSeverityColor(knot.severity)
    lines.push(`  ${sevColor(`Knot ${i + 1}:`)} ${knot.type} (${knot.files.length} files) severity: ${sevColor(knot.severity)}`)
    lines.push(chalk.dim(`    Cycle: ${knot.files.join(' → ')} → ${knot.files[0]}`))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

/**
 * Get color for knot severity.
 *
 * @example
 * knotSeverityColor('high')
 */
export function knotSeverityColor(severity: KnotSeverity): (t: string) => string {
  if (severity === 'high') return chalk.rgb(244, 67, 54)
  if (severity === 'medium') return chalk.rgb(255, 193, 7)
  return chalk.dim
}

// ─── Fabric Score Table ───────────────────────────────────────────────────────

/**
 * Format fabric score table.
 *
 * @example
 * formatFabricTable(fabric)
 */
export function formatFabricTable(fabric: FabricScore[]): string {
  if (fabric.length === 0) return chalk.dim('  No fabric data.')
  const lines: string[] = []
  lines.push(chalk.bold('  Fabric Scores:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  File                     In   Out  Density  Texture  Role'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))

  const sorted = [...fabric].sort((a, b) => b.textureScore - a.textureScore)
  for (const f of sorted) {
    const name = f.file.length > 24 ? '...' + f.file.slice(-21) : f.file
    const roleColor = roleColorFn(f.role)
    const texColor = f.textureScore >= 70 ? chalk.green : f.textureScore >= 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    lines.push(`  ${name.padEnd(25)}${String(f.incomingThreads).padStart(3)}  ${String(f.outgoingThreads).padStart(3)}  ${String(f.density).padStart(7)}  ${texColor(String(f.textureScore).padStart(7))}  ${roleColor(f.role)}`)
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

/**
 * Get color for file role.
 *
 * @example
 * roleColorFn('core')
 */
export function roleColorFn(role: FileRole): (t: string) => string {
  switch (role) {
    case 'core': return chalk.rgb(244, 67, 54)
    case 'bridge': return chalk.rgb(33, 150, 243)
    case 'utility': return chalk.rgb(76, 175, 80)
    case 'leaf': return chalk.rgb(255, 193, 7)
    case 'orphan': return chalk.dim
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format weaver stats.
 *
 * @example
 * formatWeaverStats(stats)
 */
export function formatWeaverStats(stats: WeaverStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Weaver Stats:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  lines.push(`  Threads: ${stats.totalThreads} | Avg strength: ${stats.avgThreadStrength}`)
  lines.push(`  Patterns: ${stats.patternCount} (tight: ${stats.tightWeaveCount}, loose: ${stats.looseWeaveCount})`)
  lines.push(`  Knots: ${stats.knotCount} (simple: ${stats.simpleKnotCount}, complex: ${stats.complexKnotCount})`)
  lines.push(`  Density: ${stats.overallDensity.toFixed(2)} | Health: ${stats.overallHealth}/100`)
  lines.push(`  Most connected: ${stats.mostConnectedFile}`)
  lines.push(`  Least connected: ${stats.leastConnectedFile}`)
  lines.push(`  Avg texture: ${stats.avgTextureScore}`)
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full weaver table output.
 *
 * @example
 * formatWeaverTable(result)
 */
export function formatWeaverTable(result: WeaverResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Weaver — Dependency Interconnection Analysis\n'))
  sections.push(formatThreads(result.threads))
  sections.push('')
  sections.push(formatPatterns(result.patterns))
  sections.push('')
  sections.push(formatKnots(result.knots))
  sections.push('')
  sections.push(formatFabricTable(result.fabric))
  sections.push('')
  sections.push(formatWeaverStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format weaver result as JSON.
 *
 * @example
 * formatWeaverJSON(result)
 */
export function formatWeaverJSON(result: WeaverResult): string {
  return JSON.stringify(result, null, 2)
}
