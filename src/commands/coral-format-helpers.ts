import chalk from 'chalk'
import type { CoralResult, CoralColony, CoralPolyp, ReefZone, SymbioticRelation, CoralStats } from './coral-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function healthColor(h: string): string {
  if (h === 'thriving') return chalk.green(h)
  if (h === 'healthy') return chalk.blue(h)
  if (h === 'stressed') return chalk.yellow(h)
  if (h === 'bleaching') return chalk.magenta(h)
  return chalk.red(h)
}

function reefColor(r: string): string {
  if (r === 'great-barrier') return chalk.green(r)
  if (r === 'healthy-reef') return chalk.blue(r)
  if (r === 'stressed-reef') return chalk.yellow(r)
  if (r === 'bleached-reef') return chalk.magenta(r)
  return chalk.red(r)
}

function polypColor(p: string): string {
  if (p === 'branching') return chalk.green(p)
  if (p === 'massive') return chalk.red(p)
  if (p === 'plate') return chalk.blue(p)
  if (p === 'columnar') return chalk.cyan(p)
  if (p === 'encrusting') return chalk.yellow(p)
  return chalk.dim(p)
}

function symbiosisColor(s: string): string {
  if (s === 'mutualistic') return chalk.green(s)
  if (s === 'commensal') return chalk.blue(s)
  return chalk.red(s)
}

function zoneColor(z: string): string {
  if (z === 'reef-flat') return chalk.green(z)
  if (z === 'reef-crest') return chalk.blue(z)
  if (z === 'fore-reef') return chalk.cyan(z)
  if (z === 'lagoon') return chalk.yellow(z)
  return chalk.dim(z)
}

// ─── Colony Formatting ─────────────────────────────────────────────────────────

function formatColony(c: CoralColony): string {
  return `  ${chalk.bold(c.name)} ${healthColor(c.health)} size:${c.size} growth:${scoreColor(c.growthRate)} diversity:${scoreColor(c.diversity)}`
}

// ─── Polyp Formatting ──────────────────────────────────────────────────────────

function formatPolyp(p: CoralPolyp): string {
  const keystone = p.isKeystone ? chalk.green(' ★keystone') : ''
  const invasive = p.isInvasive ? chalk.red(' ⚠invasive') : ''
  return `  ${chalk.bold(p.file)} ${polypColor(p.type)} health:${scoreColor(p.health)} risk:${scoreColor(p.bleachingRisk)}${keystone}${invasive}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: CoralStats): string {
  return [
    `  Reef: ${reefColor(stats.overallReef)} | Health: ${scoreColor(stats.reefHealth)} | Biodiversity: ${scoreColor(stats.biodiversityIndex)} | Stability: ${scoreColor(stats.ecosystemStability)}`,
    `  Polyps: ${stats.totalPolyps} (${stats.branchingPolyps} branching, ${stats.massivePolyps} massive) | Colonies: ${stats.totalColonies}`,
    `  Keystone: ${chalk.green(String(stats.keystonePolyps))} | Invasive: ${chalk.red(String(stats.invasivePolyps))} | Thriving: ${stats.thrivingColonies} | Bleaching: ${stats.bleachingColonies}`,
    `  Symbiosis: ${stats.totalSymbiosis} (${chalk.green(String(stats.mutualisticRelations))} mutual, ${chalk.red(String(stats.parasiticRelations))} parasitic)`,
    `  Avg Complexity: ${scoreColor(stats.avgComplexity)} | Avg Bleaching Risk: ${scoreColor(stats.avgBleachingRisk)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format coral result as a table
 * @example
 * formatCoralTable(result, false) // string
 */
export function formatCoralTable(result: CoralResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🪸 Coral — Code Reef Growth Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🏝️ Colonies'))
  if (result.colonies.length === 0) {
    lines.push(chalk.dim('  No colonies detected.'))
  } else {
    const display = verbose ? result.colonies : result.colonies.slice(0, 8)
    lines.push(display.map(c => formatColony(c)).join('\n'))
  }
  lines.push('')

  lines.push(chalk.bold('🪸 Polyps'))
  if (result.polyps.length === 0) {
    lines.push(chalk.dim('  No polyps detected.'))
  } else {
    const display = verbose ? result.polyps : result.polyps.slice(0, 10)
    lines.push(display.map(p => formatPolyp(p)).join('\n'))
  }
  lines.push('')

  lines.push(chalk.bold('🗺️ Reef Zones'))
  if (result.zones.length === 0) {
    lines.push(chalk.dim('  No zones detected.'))
  } else {
    lines.push(result.zones.slice(0, 8).map(z =>
      `  ${chalk.bold(z.name)} ${zoneColor(z.type)} biod:${scoreColor(z.biodiversity)} complexity:${scoreColor(z.structuralComplexity)} (${z.files.length} files)`
    ).join('\n'))
  }
  lines.push('')

  if (result.symbiosis.length > 0) {
    lines.push(chalk.bold('🤝 Symbiosis'))
    lines.push(result.symbiosis.slice(0, 6).map(s =>
      `  ${symbiosisColor(s.type)} ${s.host} ↔ ${s.symbiont} (${s.strength}%)`
    ).join('\n'))
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format coral result as JSON
 * @example
 * formatCoralJson(result) // string
 */
export function formatCoralJson(result: CoralResult): string {
  return JSON.stringify(result, null, 2)
}
