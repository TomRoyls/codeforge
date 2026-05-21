import chalk from 'chalk'
import type { SuspensionBridgeResult, BridgeSpan, BridgeNetwork, SuspensionBridgeStats } from './suspension-bridge-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'golden-gate') return chalk.rgb(255, 215, 0)(c)
  if (c === 'modern-marvel') return chalk.green(c)
  if (c === 'sound-structure') return chalk.blue(c)
  if (c === 'needs-maintenance') return chalk.yellow(c)
  if (c === 'structurally-deficient') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function networkTypeColor(n: string): string {
  if (n === 'interstate-system') return chalk.rgb(255, 215, 0)(n)
  if (n === 'state-highway') return chalk.green(n)
  if (n === 'county-road') return chalk.blue(n)
  if (n === 'city-street') return chalk.cyan(n)
  if (n === 'footbridge') return chalk.yellow(n)
  return chalk.red(n)
}

function gradeColor(g: string): string {
  if (g === 'chief-engineer') return chalk.rgb(255, 215, 0)(g)
  if (g === 'senior-engineer') return chalk.green(g)
  if (g === 'engineer') return chalk.blue(g)
  if (g === 'technician') return chalk.cyan(g)
  if (g === 'handyman') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Span Formatting ───────────────────────────────────────────────────────

function formatSpan(s: BridgeSpan): string {
  return `  ${chalk.bold(s.file)} ${conditionColor(s.condition)} quality:${scoreColor(s.qualityScore)} cable:${scoreColor(s.cableStrength)} deck:${scoreColor(s.deckStability)} tower:${scoreColor(s.towerIntegrity)}`
}

// ─── Network Formatting ────────────────────────────────────────────────────

function formatNetwork(n: BridgeNetwork): string {
  return `  ${chalk.bold(n.directory)} ${networkTypeColor(n.networkType)} cable:${scoreColor(n.avgCableStrength)} deck:${scoreColor(n.avgDeckStability)} tower:${scoreColor(n.avgTowerIntegrity)} golden:${n.goldenGateCount} condemned:${n.condemnedCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: SuspensionBridgeStats): string {
  return [
    `  Grade: ${gradeColor(stats.engineerGrade)} | Integrity: ${scoreColor(stats.overallIntegrity)} | Files: ${stats.totalFiles} | Networks: ${stats.totalNetworks}`,
    `  Cable: ${scoreColor(stats.avgCableStrength)} | Deck: ${scoreColor(stats.avgDeckStability)} | Tower: ${scoreColor(stats.avgTowerIntegrity)} | Anchor: ${scoreColor(stats.avgAnchorSecurity)} | Load: ${scoreColor(stats.avgLoadDistribution)} | Span: ${scoreColor(stats.avgSpanClarity)}`,
    `  Conditions: Golden:${stats.goldenGateCount} Marvel:${stats.modernMarvelCount} Sound:${stats.soundStructureCount} Maintenance:${stats.needsMaintenanceCount} Deficient:${stats.structurallyDeficientCount} Condemned:${stats.condemnedCount}`,
    `  Best: ${chalk.green(stats.bestSpan)} | Strongest Cable: ${chalk.cyan(stats.strongestCable)} | Clearest: ${chalk.blue(stats.clearestSpan)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format suspension bridge result as a table
 * @example
 * formatSuspensionBridgeTable(result, false) // string
 */
export function formatSuspensionBridgeTable(result: SuspensionBridgeResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌉 Suspension Bridge - Code Connection/Resilience Analysis\n'))
  lines.push(chalk.bold('═'.repeat(55)))
  lines.push('')

  lines.push(chalk.bold('🔬 Spans'))
  if (result.spans.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.spans : result.spans.slice(0, 15)
    for (const s of display) {
      lines.push(formatSpan(s))
    }
    if (!verbose && result.spans.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.spans.length - 15} more`))
    }
  }
  lines.push('')

  if (result.networks.length > 0) {
    lines.push(chalk.bold('🗺️ Networks'))
    for (const n of result.networks) {
      lines.push(formatNetwork(n))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format suspension bridge result as JSON
 * @example
 * formatSuspensionBridgeJson(result) // string
 */
export function formatSuspensionBridgeJson(result: SuspensionBridgeResult): string {
  return JSON.stringify(result, null, 2)
}
