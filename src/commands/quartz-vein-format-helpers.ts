import chalk from 'chalk'

import type { QuartzCrystal, QuartzMeridianResult, QuartzStratum, StratumCondition } from './quartz-vein-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 220, 240)(String(score))
  if (score >= 75) return chalk.rgb(140, 190, 220)(String(score))
  if (score >= 60) return chalk.rgb(100, 160, 200)(String(score))
  if (score >= 40) return chalk.rgb(80, 130, 170)(String(score))
  if (score >= 20) return chalk.rgb(60, 100, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorStratumCondition('crystal-canyon') */
export function colorStratumCondition(condition: StratumCondition | string): string {
  switch (condition) {
    case 'crystal-canyon': return chalk.rgb(180, 220, 240)('crystal-canyon')
    case 'quartz-ridge': return chalk.rgb(140, 190, 220)('quartz-ridge')
    case 'proper-formation': return chalk.rgb(100, 160, 200)('proper-formation')
    case 'dull-outcrop': return chalk.rgb(80, 130, 170)('dull-outcrop')
    case 'rubble': return chalk.rgb(60, 100, 140)('rubble')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatCrystalTable(crystal) */
export function formatCrystalTable(crystal: QuartzCrystal): string {
  const lines: string[] = [
    chalk.bold(`Quartz Crystal: ${crystal.file}`),
    '',
    `  Crystalline Clarity:  ${colorScore(crystal.crystallineClarity)}  ${chalk.dim(`(${crystal.transmitting.crystal})`)}`,
    `  Vibration Quality:   ${colorScore(crystal.vibrationQuality)}  ${chalk.dim(`(${crystal.oscillating.frequency})`)}`,
    `  Resonance Purity:    ${colorScore(crystal.resonancePurity)}  ${chalk.dim(`(${crystal.resonating.signal})`)}`,
    `  Structure Strength:  ${colorScore(crystal.structureStrength)}  ${chalk.dim(`(${crystal.supporting.lattice})`)}`,
    `  Vein Wisdom:         ${colorScore(crystal.veinWisdom)}  ${chalk.dim(`(${crystal.channeling.vein})`)}`,
    '',
    `  Quality Score: ${colorScore(crystal.qualityScore)}  ${chalk.dim(`(${crystal.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatCrystalsTable(crystals) */
export function formatCrystalsTable(crystals: QuartzCrystal[]): string {
  if (crystals.length === 0) return chalk.dim('No quartz crystals found')
  const colWidths = {
    file: Math.max(4, ...crystals.map((c) => c.file.length)),
    clarity: Math.max(7, ...crystals.map((c) => String(c.crystallineClarity).length)),
    quality: Math.max(7, ...crystals.map((c) => String(c.vibrationQuality).length)),
    purity: Math.max(6, ...crystals.map((c) => String(c.resonancePurity).length)),
    strength: Math.max(9, ...crystals.map((c) => String(c.structureStrength).length)),
    wisdom: Math.max(6, ...crystals.map((c) => String(c.veinWisdom).length)),
    score: Math.max(5, ...crystals.map((c) => String(c.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Quartz Crystals'), '']
  const header =
    chalk.rgb(180, 220, 240)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Quality', colWidths.quality)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Purity', colWidths.purity)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Strength', colWidths.strength)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const c of crystals) {
    lines.push(
      padRight(c.file, colWidths.file) + '  ' +
      padLeft(String(c.crystallineClarity), colWidths.clarity) + '  ' +
      padLeft(String(c.vibrationQuality), colWidths.quality) + '  ' +
      padLeft(String(c.resonancePurity), colWidths.purity) + '  ' +
      padLeft(String(c.structureStrength), colWidths.strength) + '  ' +
      padLeft(String(c.veinWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(c.qualityScore), colWidths.score))
  }
  return lines.join('\n')
}

/** @example formatStratumTable(stratum) */
export function formatStratumTable(stratum: QuartzStratum): string {
  const lines: string[] = [
    chalk.bold(`Quartz Stratum: ${stratum.directory}`),
    '',
    `  Crystals:      ${stratum.crystals.length}`,
    `  Avg Clarity:   ${colorScore(stratum.avgClarity)}`,
    `  Avg Strength:  ${colorScore(stratum.avgStrength)}`,
    `  Avg Wisdom:    ${colorScore(stratum.avgWisdom)}`,
    `  Masterpieces:  ${stratum.quartzMasterpieceCount}`,
    `  Stratum Type:  ${stratum.stratumType}`,
    `  Condition:     ${colorStratumCondition(stratum.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatStrataTable(strata) */
export function formatStrataTable(strata: QuartzStratum[]): string {
  if (strata.length === 0) return chalk.dim('No quartz strata found')
  const lines: string[] = [chalk.bold('Quartz Strata'), '']
  for (const s of strata) {
    lines.push(`  ${chalk.rgb(180, 220, 240)(s.directory)}  ${colorScore(s.avgClarity)}  ${colorStratumCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: QuartzMeridianResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Quartz Meridian Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Strata:             ${stats.totalStrata}`,
    `  Avg Crystalline Clarity:  ${colorScore(stats.avgCrystallineClarity)}`,
    `  Avg Vibration Quality:    ${colorScore(stats.avgVibrationQuality)}`,
    `  Avg Resonance Purity:     ${colorScore(stats.avgResonancePurity)}`,
    `  Avg Structure Strength:   ${colorScore(stats.avgStructureStrength)}`,
    `  Avg Vein Wisdom:          ${colorScore(stats.avgVeinWisdom)}`,
    `  Quartz Masterpieces:      ${stats.quartzMasterpieceCount}`,
    `  Perfect Crystals:         ${stats.perfectCrystalCount}`,
    `  Proper Minerals:          ${stats.properMineralCount}`,
    `  Cloudy Stones:            ${stats.cloudyStoneCount}`,
    `  Cracked Rocks:            ${stats.crackedRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Luminosity:       ${colorScore(stats.overallLuminosity)}`,
    `  Geologist Grade:          ${stats.geologistGrade}`,
    `  Best Crystal:             ${stats.bestCrystal || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Strongest:                ${stats.strongest || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(180, 220, 240)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: QuartzMeridianResult): string {
  const lines: string[] = [
    chalk.bold('Quartz Meridian Analysis'),
    '',
    formatCrystalsTable(result.crystals),
    '',
    formatStrataTable(result.strata),
    '',
    chalk.bold('Geological Overview'),
    '',
    `  Avg Clarity:      ${colorScore(result.geology.avgClarity)}`,
    `  Avg Strength:     ${colorScore(result.geology.avgStrength)}`,
    `  Avg Wisdom:       ${colorScore(result.geology.avgWisdom)}`,
    `  Luminosity:       ${colorScore(result.geology.overallLuminosity)}`,
    `  Is Quartz:        ${result.geology.isQuartz ? chalk.rgb(180, 220, 240)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: QuartzMeridianResult): string {
  return JSON.stringify(result, null, 2)
}
