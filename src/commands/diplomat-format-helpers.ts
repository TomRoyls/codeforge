import chalk from 'chalk'

import type { DiplomatResult, DiplomatStats, Nation, Tension, Treaty } from './diplomat-helpers.js'

// ─── World Map ────────────────────────────────────────────────────────────────

/**
 * Format ASCII world map of nations.
 *
 * @example
 * formatWorldMap(nations)
 */
export function formatWorldMap(nations: Nation[]): string {
  if (nations.length === 0) return chalk.gray('  No nations discovered')

  const lines: string[] = []
  lines.push(chalk.bold('  Diplomatic World Map'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const n of nations) {
    const openBar = '█'.repeat(Math.max(1, Math.round(n.openness / 10)))
    const color = n.openness > 60 ? chalk.rgb(50, 205, 50) : n.openness > 30 ? chalk.rgb(255, 165, 0) : chalk.rgb(220, 50, 50)
    lines.push(`  ${n.name.padEnd(15)} ${color(openBar)} ${n.openness}% open (${n.exports.length} exports)`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Treaty Table ─────────────────────────────────────────────────────────────

/**
 * Format treaty table with signatories.
 *
 * @example
 * formatTreatyTable(treaties)
 */
export function formatTreatyTable(treaties: Treaty[]): string {
  if (treaties.length === 0) return chalk.gray('  No treaties discovered')

  const lines: string[] = []
  lines.push(chalk.bold('  Treaties'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const t of treaties.slice(0, 15)) {
    const vis = t.isPublic ? chalk.rgb(50, 205, 50)('public') : chalk.rgb(169, 169, 169)('private')
    const strict = t.isStrict ? chalk.rgb(0, 191, 255)('strict') : chalk.rgb(255, 165, 0)('loose')
    lines.push(`  ${t.name.padEnd(20)} ${vis} ${strict} ${t.signatories.length} signatories (${t.strength})`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Tension Heatmap ──────────────────────────────────────────────────────────

/**
 * Format tension heatmap.
 *
 * @example
 * formatTensionHeatmap(tensions)
 */
export function formatTensionHeatmap(tensions: Tension[]): string {
  if (tensions.length === 0) return chalk.rgb(50, 205, 50)('  ✓ No tensions — peaceful relations')

  const lines: string[] = []
  lines.push(chalk.bold('  Tensions'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const t of tensions.slice(0, 15)) {
    const color = t.severity === 'high' ? chalk.rgb(220, 50, 50) : t.severity === 'medium' ? chalk.rgb(255, 165, 0) : chalk.rgb(255, 215, 0)
    lines.push(`  ${color(t.severity.padEnd(7))} ${t.type.padEnd(22)} ${t.between[0]} ↔ ${t.between[1]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Alliance Graph ───────────────────────────────────────────────────────────

/**
 * Format alliance graph.
 *
 * @example
 * formatAllianceGraph(alliances)
 */
export function formatAllianceGraph(alliances: DiplomatResult['alliances']): string {
  if (alliances.length === 0) return chalk.gray('  No alliances formed')

  const lines: string[] = []
  lines.push(chalk.bold('  Alliances'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const a of alliances.slice(0, 10)) {
    const bar = '●'.repeat(Math.max(1, Math.round(a.strength / 20)))
    const color = a.strength > 70 ? chalk.rgb(50, 205, 50) : chalk.rgb(255, 165, 0)
    lines.push(`  ${color(bar)} ${a.members.join(' + ')} (${a.sharedTypes.length} shared types)`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Diplomatic Health Meter ──────────────────────────────────────────────────

/**
 * Format diplomatic health meter.
 *
 * @example
 * formatDiplomaticHealthMeter(85)
 */
export function formatDiplomaticHealthMeter(health: number): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Diplomatic Health'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const filled = Math.round(health / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = health > 70 ? chalk.rgb(50, 205, 50) : health > 40 ? chalk.rgb(255, 165, 0) : chalk.rgb(220, 50, 50)
  lines.push(`  ${color(bar)} ${health}%`)

  lines.push('')
  return lines.join('\n')
}

// ─── Openness Chart ───────────────────────────────────────────────────────────

/**
 * Format openness chart.
 *
 * @example
 * formatOpennessChart(nations)
 */
export function formatOpennessChart(nations: Nation[]): string {
  if (nations.length === 0) return chalk.gray('  No openness data')

  const lines: string[] = []
  lines.push(chalk.bold('  Openness Chart'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const sorted = [...nations].sort((a, b) => b.openness - a.openness)
  for (const n of sorted) {
    const bar = '█'.repeat(Math.max(1, Math.round(n.openness / 5)))
    const color = n.openness > 60 ? chalk.rgb(50, 205, 50) : n.openness > 30 ? chalk.rgb(255, 165, 0) : chalk.rgb(220, 50, 50)
    lines.push(`  ${n.name.padEnd(15)} ${color(bar)} ${n.openness}%`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format diplomat stats.
 *
 * @example
 * formatDiplomatStats(stats)
 */
export function formatDiplomatStats(stats: DiplomatStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Diplomatic Statistics'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Nations            ${stats.nationCount}`)
  lines.push(`  Treaties           ${stats.treatyCount}`)
  lines.push(`  Alliances          ${stats.allianceCount}`)
  lines.push(`  Tensions           ${stats.tensionCount}`)
  lines.push(`  High Tensions      ${stats.highTensions}`)
  lines.push(`  Avg Openness       ${stats.avgOpenness}%`)
  lines.push(`  Diplomatic Health  ${stats.diplomaticHealth}%`)
  lines.push(`  Strongest Alliance ${stats.strongestAlliance}`)
  lines.push(`  Weakest Link       ${stats.weakestLink}`)

  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format diplomat recommendations.
 *
 * @example
 * formatDiplomatRecommendations(recs)
 */
export function formatDiplomatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Table Output ─────────────────────────────────────────────────────────────

/**
 * Format full diplomat table output.
 *
 * @example
 * formatDiplomatTable(result)
 */
export function formatDiplomatTable(result: DiplomatResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(100, 149, 237)('\n  Code Diplomat — API Contract Analysis\n'))
  parts.push(formatWorldMap(result.nations))
  parts.push(formatTreatyTable(result.treaties))
  parts.push(formatAllianceGraph(result.alliances))
  parts.push(formatTensionHeatmap(result.tensions))
  parts.push(formatDiplomaticHealthMeter(result.stats.diplomaticHealth))
  parts.push(formatOpennessChart(result.nations))
  parts.push(formatDiplomatStats(result.stats))
  parts.push(formatDiplomatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ──────────────────────────────────────────────────────────────

/**
 * Format diplomat result as JSON.
 *
 * @example
 * formatDiplomatJSON(result)
 */
export function formatDiplomatJSON(result: DiplomatResult): string {
  return JSON.stringify(result, null, 2)
}
