import chalk from 'chalk'
import type { CoralPolyp, ReefZone, CoralReefResult } from './coral-reef-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'thriving': return chalk.rgb(255, 215, 0)(c)
    case 'healthy': return chalk.green(c)
    case 'stressed': return chalk.yellow(c)
    case 'bleaching': return chalk.rgb(255, 165, 0)(c)
    case 'damaged': return chalk.rgb(255, 69, 0)(c)
    case 'dead': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function zoneColor(z: string): string {
  switch (z) {
    case 'reef-crest': return chalk.rgb(255, 215, 0)(z)
    case 'fore-reef': return chalk.green(z)
    case 'back-reef': return chalk.blue(z)
    case 'lagoon': return chalk.cyan(z)
    case 'atoll': return chalk.dim(z)
    case 'dead-zone': return chalk.red(z)
    default: return chalk.dim(z)
  }
}

function reefConditionColor(c: string): string {
  switch (c) {
    case 'pristine-reef': return chalk.rgb(255, 215, 0)(c)
    case 'healthy-reef': return chalk.green(c)
    case 'stressed-reef': return chalk.yellow(c)
    case 'degraded-reef': return chalk.rgb(255, 165, 0)(c)
    case 'bleached-reef': return chalk.rgb(255, 69, 0)(c)
    case 'dead-reef': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'marine-biologist': return chalk.rgb(255, 215, 0)(g)
    case 'reef-scientist': return chalk.green(g)
    case 'aquarist': return chalk.blue(g)
    case 'diver': return chalk.cyan(g)
    case 'tourist': return chalk.yellow(g)
    case 'polluter': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Polyp Formatting ────────────────────────────────────────────────────────

function formatPolyp(p: CoralPolyp, verbose: boolean): string {
  const line = ` ${conditionColor(p.condition)} ${chalk.bold(p.file)} health:${scoreColor(p.coralHealth)} diversity:${scoreColor(p.speciesDiversity)} symbiosis:${scoreColor(p.symbiosisQuality)} clarity:${scoreColor(p.waterClarity)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    species:${p.species.total}(${p.species.variety}) dominant:${p.species.dominant} biodiv:${scoreColor(p.biodiversityIndex)} resilience:${scoreColor(p.reefResilience)}`)
  details.push(`    reef: ${p.reef.growthForm} foundation:${p.reef.isFoundation ? chalk.green('Y') : chalk.red('N')} branching:${p.reef.isBranching ? chalk.green('Y') : chalk.red('N')} massive:${p.reef.isMassive ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    water: temp:${p.water.temperature} acid:${scoreColor(p.water.acidity)} turb:${scoreColor(p.water.turbidity)} O2:${scoreColor(p.water.oxygenLevel)} clean:${p.water.isClean ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    bleaching: risk:${scoreColor(p.bleaching.risk)} necrosis:${p.bleaching.hasNecrosis ? chalk.red('Y') : chalk.green('N')} dead:${p.bleaching.deadPortions}%`)
  details.push(`    ecosystem: habitat:${p.ecosystem.providesHabitat ? chalk.green('Y') : chalk.red('N')} keystone:${p.ecosystem.isKeystone ? chalk.green('Y') : chalk.red('N')} indicator:${p.ecosystem.isIndicator ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Zone Formatting ─────────────────────────────────────────────────────────

function formatZone(z: ReefZone): string {
  return `  ${chalk.bold(z.directory)} ${zoneColor(z.zoneType)} ${reefConditionColor(z.condition)} health:${scoreColor(z.avgHealth)} diversity:${scoreColor(z.avgDiversity)} symb:${scoreColor(z.avgSymbiosis)} clarity:${scoreColor(z.avgClarity)} species:${z.totalSpecies}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format coral reef result as a table
 * @example
 * formatCoralReefTable(result, false) // string
 */
export function formatCoralReefTable(result: CoralReefResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🪸  Coral Reef - Ecosystem Biodiversity/Symbiosis Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🪸  Coral Polyps'))
  if (result.polyps.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.polyps : result.polyps.slice(0, 15)
    for (const p of display) {
      lines.push(formatPolyp(p, verbose))
    }
    if (!verbose && result.polyps.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.polyps.length - 15} more`))
    }
  }
  lines.push('')

  if (result.zones.length > 0) {
    lines.push(chalk.bold('🏝️  Reef Zones'))
    for (const z of result.zones) {
      lines.push(formatZone(z))
    }
    lines.push('')
  }

  const o = result.ocean
  lines.push(chalk.bold('🌊 Ocean Overview'))
  lines.push(`  Health:${scoreColor(o.avgHealth)} Diversity:${scoreColor(o.avgDiversity)} Symbiosis:${scoreColor(o.avgSymbiosis)} Clarity:${scoreColor(o.avgClarity)} Biodiversity:${scoreColor(o.totalBiodiversity)} Healthy:${o.isHealthy ? chalk.green('YES') : chalk.red('NO')} ReefHealth:${scoreColor(o.overallReefHealth)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.marineBiologistGrade)} | ReefHealth: ${scoreColor(s.overallReefHealth)} | Files: ${s.totalFiles} | Zones: ${s.totalZones}`)
  lines.push(`  Thriving:${s.thrivingCount} Healthy:${s.healthyCount} Stressed:${s.stressedCount} Bleaching:${s.bleachingCount} Damaged:${s.damagedCount} Dead:${s.deadCount}`)
  lines.push(`  AvgMutualism:${scoreColor(s.avgMutualism)} AvgParasitism:${scoreColor(s.avgParasitism)} Foundation:${s.foundationModules} Keystone:${s.keystoneModules}`)
  lines.push(`  Clean:${s.isCleanCount} Polluted:${s.isPollutedCount} Zooxanthellae:${s.hasZooxanthellaeCount} Habitat:${s.providesHabitatCount} TotalSpecies:${s.totalSpecies}`)
  lines.push(`  Healthiest:${chalk.green(s.healthiestPolyp)} | MostDiverse:${chalk.cyan(s.mostDiverse)} | BestSymbiosis:${chalk.blue(s.bestSymbiosis)}`)
  lines.push(`  MostPolluted:${chalk.red(s.mostPolluted)} | MostBleached:${chalk.rgb(255, 69, 0)(s.mostBleached)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format coral reef result as JSON
 * @example
 * formatCoralReefJson(result) // string
 */
export function formatCoralReefJson(result: CoralReefResult): string {
  return JSON.stringify(result, null, 2)
}
