import chalk from 'chalk'

import type { CoralReefResult } from './coral-reef-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('pristine-reef') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'pristine-reef': return chalk.rgb(255, 215, 0).bold(condition)
    case 'healthy-reef': return chalk.rgb(46, 204, 113)(condition)
    case 'recovering-reef': return chalk.rgb(52, 152, 219)(condition)
    case 'stressed-reef': return chalk.rgb(241, 196, 15)(condition)
    case 'degraded': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-zone': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('reef-guardian') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'reef-guardian': return chalk.rgb(255, 215, 0).bold(grade)
    case 'marine-biologist': return chalk.rgb(46, 204, 113)(grade)
    case 'conservationist': return chalk.rgb(155, 89, 182)(grade)
    case 'observer': return chalk.rgb(52, 152, 219)(grade)
    case 'tourist': return chalk.rgb(241, 196, 15)(grade)
    case 'polluter': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example formationColor('barrier-reef') returns colored string */
export function formationColor(formation: string): string {
  switch (formation) {
    case 'barrier-reef': return chalk.rgb(255, 215, 0).bold(formation)
    case 'atoll': return chalk.rgb(46, 204, 113)(formation)
    case 'fringing-reef': return chalk.rgb(155, 89, 182)(formation)
    case 'patch-reef': return chalk.rgb(52, 152, 219)(formation)
    case 'rubble': return chalk.rgb(241, 196, 15)(formation)
    case 'sand': return chalk.rgb(231, 76, 60)(formation)
    default: return formation
  }
}

/** @example vitalityColor('thriving') returns colored string */
export function vitalityColor(vitality: string): string {
  switch (vitality) {
    case 'thriving': return chalk.rgb(255, 215, 0).bold(vitality)
    case 'healthy': return chalk.rgb(46, 204, 113)(vitality)
    case 'stressed': return chalk.rgb(155, 89, 182)(vitality)
    case 'declining': return chalk.rgb(52, 152, 219)(vitality)
    case 'dying': return chalk.rgb(241, 196, 15)(vitality)
    case 'dead': return chalk.rgb(231, 76, 60)(vitality)
    default: return vitality
  }
}

/** @example harmonyColor('perfect-symbiosis') returns colored string */
export function harmonyColor(harmony: string): string {
  switch (harmony) {
    case 'perfect-symbiosis': return chalk.rgb(255, 215, 0).bold(harmony)
    case 'mutualism': return chalk.rgb(46, 204, 113)(harmony)
    case 'commensalism': return chalk.rgb(155, 89, 182)(harmony)
    case 'neutral': return chalk.rgb(52, 152, 219)(harmony)
    case 'parasitism': return chalk.rgb(241, 196, 15)(harmony)
    case 'toxic': return chalk.rgb(231, 76, 60)(harmony)
    default: return harmony
  }
}

/** @example strengthColor('tide-proof') returns colored string */
export function strengthColor(strength: string): string {
  switch (strength) {
    case 'tide-proof': return chalk.rgb(255, 215, 0).bold(strength)
    case 'storm-resistant': return chalk.rgb(46, 204, 113)(strength)
    case 'weathered': return chalk.rgb(155, 89, 182)(strength)
    case 'vulnerable': return chalk.rgb(52, 152, 219)(strength)
    case 'fragile': return chalk.rgb(241, 196, 15)(strength)
    case 'washed-away': return chalk.rgb(231, 76, 60)(strength)
    default: return strength
  }
}

/** @example richnessColor('mega-diverse') returns colored string */
export function richnessColor(richness: string): string {
  switch (richness) {
    case 'mega-diverse': return chalk.rgb(255, 215, 0).bold(richness)
    case 'high-diversity': return chalk.rgb(46, 204, 113)(richness)
    case 'moderate': return chalk.rgb(155, 89, 182)(richness)
    case 'low-diversity': return chalk.rgb(52, 152, 219)(richness)
    case 'monoculture': return chalk.rgb(241, 196, 15)(richness)
    case 'barren': return chalk.rgb(231, 76, 60)(richness)
    default: return richness
  }
}

/** @example bleachingStatusColor('pristine') returns colored string */
export function bleachingStatusColor(status: string): string {
  switch (status) {
    case 'pristine': return chalk.rgb(255, 215, 0).bold(status)
    case 'healthy': return chalk.rgb(46, 204, 113)(status)
    case 'warning': return chalk.rgb(52, 152, 219)(status)
    case 'stressed': return chalk.rgb(241, 196, 15)(status)
    case 'bleaching': return chalk.rgb(230, 126, 34)(status)
    case 'dead-zone': return chalk.rgb(231, 76, 60)(status)
    default: return status
  }
}

/** @example zoneTypeColor('great-barrier') returns colored string */
export function zoneTypeColor(type: string): string {
  switch (type) {
    case 'great-barrier': return chalk.rgb(255, 215, 0).bold(type)
    case 'major-reef': return chalk.rgb(46, 204, 113)(type)
    case 'atoll-system': return chalk.rgb(155, 89, 182)(type)
    case 'patch-system': return chalk.rgb(52, 152, 219)(type)
    case 'rocky-shore': return chalk.rgb(241, 196, 15)(type)
    case 'mud-flat': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCoralReefJson(result) returns JSON string */
export function formatCoralReefJson(result: CoralReefResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCoralReefTable(result, verbose) returns formatted string */
export function formatCoralReefTable(result: CoralReefResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(52, 152, 219).bold('  Coral Reef Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Ocean Overview:'))
  lines.push(`    Overall Health:          ${scoreColor(result.ocean.overallHealth)}`)
  lines.push(`    Avg Reef Structure:      ${scoreColor(result.ocean.avgStructure)}`)
  lines.push(`    Avg Symbiosis Index:     ${scoreColor(result.ocean.avgSymbiosis)}`)
  lines.push(`    Avg Bleaching Risk:      ${scoreColor(result.ocean.avgBleaching)}`)
  lines.push(`    Is Healthy:              ${result.ocean.isHealthy ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Zones:              ${result.stats.totalZones}`)
  lines.push(`    Avg Reef Structure:       ${scoreColor(result.stats.avgReefStructure)}`)
  lines.push(`    Avg Polyp Health:         ${scoreColor(result.stats.avgPolypHealth)}`)
  lines.push(`    Avg Symbiosis Index:      ${scoreColor(result.stats.avgSymbiosisIndex)}`)
  lines.push(`    Avg Tide Resilience:      ${scoreColor(result.stats.avgTideResilience)}`)
  lines.push(`    Avg Biodiversity:         ${scoreColor(result.stats.avgBiodiversity)}`)
  lines.push(`    Avg Bleaching Risk:       ${scoreColor(result.stats.avgBleachingRisk)}`)
  lines.push(`    Guardian Grade:           ${gradeColor(result.stats.guardianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Pristine Reef:      ${result.stats.pristineReefCount}`)
  lines.push(`    Healthy Reef:       ${result.stats.healthyReefCount}`)
  lines.push(`    Recovering:         ${result.stats.recoveringCount}`)
  lines.push(`    Stressed:           ${result.stats.stressedCount}`)
  lines.push(`    Degraded:           ${result.stats.degradedCount}`)
  lines.push(`    Dead Zone:          ${result.stats.deadZoneCount}`)
  lines.push('')

  if (result.stats.bestColony) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Colony:          ${result.stats.bestColony}`)
    lines.push(`    Best Structured:      ${result.stats.bestStructured}`)
    lines.push(`    Healthiest:           ${result.stats.healthiest}`)
    lines.push(`    Most Harmonious:      ${result.stats.mostHarmonious}`)
    lines.push(`    Most Resilient:       ${result.stats.mostResilient}`)
    lines.push(`    Most Diverse:         ${result.stats.mostDiverse}`)
    lines.push('')
  }

  if (verbose && result.colonies.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const colony of result.colonies) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(colony.file)}`)
      lines.push(`      Score: ${scoreColor(colony.qualityScore)}  Condition: ${conditionColor(colony.condition)}`)
      lines.push(`      Reef: ${formationColor(colony.reef.formation)}(${colony.reefStructure})  Polyp: ${vitalityColor(colony.polyp.vitality)}(${colony.polypHealth})  Symbiosis: ${harmonyColor(colony.symbiosis.harmony)}(${colony.symbiosisIndex})`)
      lines.push(`      Tide: ${strengthColor(colony.tide.strength)}(${colony.tideResilience})  Bio: ${richnessColor(colony.bio.richness)}(${colony.biodiversity})  Bleaching: ${bleachingStatusColor(colony.bleaching.status)}(${colony.bleachingRisk})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)('\u{1F41C}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
