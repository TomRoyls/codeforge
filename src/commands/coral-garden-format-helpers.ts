import chalk from 'chalk'

import type {
  CoralSpecimen,
  CoralBed,
  CoralStats,
  CoralGardenResult,
} from './coral-garden-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('thriving-reef') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'thriving-reef': return chalk.rgb(46, 204, 113).bold(condition)
    case 'healthy-garden': return chalk.rgb(52, 152, 219)(condition)
    case 'recovering-coral': return chalk.rgb(155, 89, 182)(condition)
    case 'stressed-reef': return chalk.rgb(241, 196, 15)(condition)
    case 'bleaching-event': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-skeleton': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example speciesColor('brain-coral') returns colored string */
export function speciesColor(species: string): string {
  switch (species) {
    case 'brain-coral': return chalk.rgb(46, 204, 113)(species)
    case 'staghorn': return chalk.rgb(52, 152, 219)(species)
    case 'elkhorn': return chalk.rgb(155, 89, 182)(species)
    case 'table-coral': return chalk.rgb(241, 196, 15)(species)
    case 'pillar-coral': return chalk.rgb(230, 126, 34)(species)
    case 'sea-fan': return chalk.rgb(231, 76, 60)(species)
    default: return species
  }
}

/** @example marineGradeColor('marine-biologist') returns bold string */
export function marineGradeColor(grade: string): string {
  switch (grade) {
    case 'marine-biologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'reef-scientist': return chalk.rgb(52, 152, 219)(grade)
    case 'oceanographer': return chalk.rgb(155, 89, 182)(grade)
    case 'diver': return chalk.rgb(241, 196, 15)(grade)
    case 'snorkeler': return chalk.rgb(230, 126, 34)(grade)
    case 'beachgoer': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example bedCondColor('marine-sanctuary') returns colored string */
export function bedCondColor(condition: string): string {
  switch (condition) {
    case 'marine-sanctuary': return chalk.rgb(46, 204, 113)(condition)
    case 'national-park': return chalk.rgb(52, 152, 219)(condition)
    case 'protected-area': return chalk.rgb(155, 89, 182)(condition)
    case 'stressed-zone': return chalk.rgb(241, 196, 15)(condition)
    case 'bleaching-zone': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-zone': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── Format Specimen ───────────────────────────────────────────────────────

/** @example formatSpecimen(spec, false) returns formatted string */
export function formatSpecimen(spec: CoralSpecimen, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(spec.file)} ${conditionColor(spec.condition)} ${scoreColor(spec.qualityScore)}`)
  lines.push(`    Coral: ${scoreColor(spec.coralHealth)} ${speciesColor(spec.coral.species)} | Polyp: ${scoreColor(spec.polypActivity)}`)
  lines.push(`    Diversity: ${scoreColor(spec.reefDiversity)} | Symbiosis: ${scoreColor(spec.symbioticNetwork)}`)
  lines.push(`    Growth: ${scoreColor(spec.growthRate)} | Water: ${scoreColor(spec.waterQuality)}`)

  if (verbose) {
    if (spec.coral.diseaseCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Diseases:')} ${spec.coral.diseaseCount}`)
    if (spec.symbiosis.hasParasiticSponge) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Parasitic sponge detected')}`)
    if (spec.environment.pollutionCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Pollution:')} ${spec.environment.pollutionCount}`)
  }

  return lines.join('\n')
}

/** @example formatBed(bed, false) returns formatted string */
export function formatBed(bed: CoralBed, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(bed.directory)} ${bedCondColor(bed.condition)} (${bed.bedType})`)
  lines.push(`  Avg Health: ${scoreColor(bed.avgHealth)} | Avg Diversity: ${scoreColor(bed.avgDiversity)} | Avg Symbiosis: ${scoreColor(bed.avgSymbiosis)}`)

  if (verbose) {
    lines.push(`  Thriving: ${bed.thrivingCount} | Dead: ${bed.deadCount} | Mutualism: ${bed.mutualismCount} | Active: ${bed.activePolypCount}`)
    for (const spec of bed.specimens) {
      lines.push(formatSpecimen(spec, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: CoralStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Coral Garden Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Beds: ${stats.totalBeds}`)
  lines.push(`Avg Health: ${scoreColor(stats.avgCoralHealth)} | Avg Polyp: ${scoreColor(stats.avgPolypActivity)} | Avg Diversity: ${scoreColor(stats.avgReefDiversity)}`)
  lines.push(`Avg Symbiosis: ${scoreColor(stats.avgSymbioticNetwork)} | Avg Growth: ${scoreColor(stats.avgGrowthRate)} | Avg Water: ${scoreColor(stats.avgWaterQuality)}`)
  lines.push(`Overall: ${scoreColor(stats.overallHealth)} | Grade: ${marineGradeColor(stats.marineGrade)}`)
  lines.push(`Conditions: Thriving=${stats.thrivingReefCount} Healthy=${stats.healthyGardenCount} Recovering=${stats.recoveringCoralCount} Stressed=${stats.stressedReefCount} Bleaching=${stats.bleachingEventCount} Dead=${stats.deadSkeletonCount}`)
  lines.push(`Best: ${stats.bestSpecimen} | Healthiest: ${stats.healthiestCoral} | Active: ${stats.mostActive}`)
  lines.push(`Diverse: ${stats.mostDiverse} | Symbiosis: ${stats.bestSymbiosis}`)
  return lines.join('\n')
}

// ─── Table Format ──────────────────────────────────────────────────────────

/** @example formatCoralGardenTable(result, false) returns table string */
export function formatCoralGardenTable(result: CoralGardenResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Coral Garden Analysis ===\n'))

  if (result.specimens.length > 0) {
    lines.push(chalk.bold('Coral Specimens:'))
    for (const spec of result.specimens) {
      lines.push(formatSpecimen(spec, verbose))
    }
  }

  if (result.beds.length > 0) {
    lines.push(chalk.bold('\nCoral Beds:'))
    for (const bed of result.beds) {
      lines.push(formatBed(bed, verbose))
    }
  }

  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('\nRecommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────

/** @example formatCoralGardenJson(result) returns JSON string */
export function formatCoralGardenJson(result: CoralGardenResult): string {
  return JSON.stringify(result, null, 2)
}
