import chalk from 'chalk'

import type { SeamCondition, CrystalCondition, QuartzCrystal, QuartzSeam, QuartzMeridianStats, QuartzMeridianResult } from './quartz-meridian-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 220, 240)(String(score))
  if (score >= 75) return chalk.rgb(150, 200, 230)(String(score))
  if (score >= 60) return chalk.rgb(120, 180, 220)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('quartz-masterpiece') */
export function colorCondition(condition: CrystalCondition | string): string {
  switch (condition) {
    case 'quartz-masterpiece':
      return chalk.rgb(180, 220, 240)('quartz-masterpiece')
    case 'crystal-vein':
      return chalk.rgb(150, 200, 230)('crystal-vein')
    case 'proper-mineral':
      return chalk.rgb(120, 180, 220)('proper-mineral')
    case 'dull-stone':
      return chalk.yellow('dull-stone')
    case 'cracked-rock':
      return chalk.rgb(255, 165, 0)('cracked-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorSeamCondition('crystal-cathedral') */
export function colorSeamCondition(condition: SeamCondition | string): string {
  switch (condition) {
    case 'crystal-cathedral':
      return chalk.rgb(180, 220, 240)('crystal-cathedral')
    case 'quartz-cavern':
      return chalk.rgb(150, 200, 230)('quartz-cavern')
    case 'proper-mine':
      return chalk.rgb(120, 180, 220)('proper-mine')
    case 'dull-tunnel':
      return chalk.yellow('dull-tunnel')
    case 'collapsed-shaft':
      return chalk.rgb(255, 165, 0)('collapsed-shaft')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatCrystalTable(crystal) */
export function formatCrystalTable(crystal: QuartzCrystal): string {
  const lines: string[] = [
    chalk.bold(`Quartz Crystal: ${crystal.file}`),
    '',
    `  Crystalline Clarity: ${colorScore(crystal.crystallineClarity)}  ${chalk.dim(`(${crystal.transmitting.crystal})`)}`,
    `  Vibration Quality:   ${colorScore(crystal.vibrationQuality)}  ${chalk.dim(`(${crystal.oscillating.frequency})`)}`,
    `  Resonance Purity:    ${colorScore(crystal.resonancePurity)}  ${chalk.dim(`(${crystal.resonating.tone})`)}`,
    `  Structure Strength:  ${colorScore(crystal.structureStrength)}  ${chalk.dim(`(${crystal.supporting.lattice})`)}`,
    `  Vein Wisdom:         ${colorScore(crystal.veinWisdom)}  ${chalk.dim(`(${crystal.channeling.vein})`)}`,
    '',
    `  Quality Score: ${colorScore(crystal.qualityScore)}  ${chalk.dim(`(${colorCondition(crystal.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatCrystalsTable(crystals) */
export function formatCrystalsTable(crystals: QuartzCrystal[]): string {
  if (crystals.length === 0) return chalk.dim('No quartz crystals found')

  const colWidths = {
    file: Math.max(4, ...crystals.map((c) => c.file.length)),
    clarity: Math.max(7, ...crystals.map((c) => String(c.crystallineClarity).length)),
    vibration: Math.max(9, ...crystals.map((c) => String(c.vibrationQuality).length)),
    purity: Math.max(6, ...crystals.map((c) => String(c.resonancePurity).length)),
    strength: Math.max(9, ...crystals.map((c) => String(c.structureStrength).length)),
    wisdom: Math.max(7, ...crystals.map((c) => String(c.veinWisdom).length)),
    score: Math.max(5, ...crystals.map((c) => String(c.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Quartz Crystals'), '']

  const header =
    chalk.rgb(180, 220, 240)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Vibration', colWidths.vibration)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Purity', colWidths.purity)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Strength', colWidths.strength)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(180, 220, 240)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const c of crystals) {
    lines.push(
      padRight(c.file, colWidths.file) +
        '  ' +
        padLeft(String(c.crystallineClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(c.vibrationQuality), colWidths.vibration) +
        '  ' +
        padLeft(String(c.resonancePurity), colWidths.purity) +
        '  ' +
        padLeft(String(c.structureStrength), colWidths.strength) +
        '  ' +
        padLeft(String(c.veinWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(c.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatSeamTable(seam) */
export function formatSeamTable(seam: QuartzSeam): string {
  const lines: string[] = [
    chalk.bold(`Quartz Seam: ${seam.directory}`),
    '',
    `  Crystals:     ${seam.crystals.length}`,
    `  Avg Clarity:  ${colorScore(seam.avgClarity)}`,
    `  Avg Strength: ${colorScore(seam.avgStrength)}`,
    `  Avg Wisdom:   ${colorScore(seam.avgWisdom)}`,
    `  Masterpieces: ${seam.quartzMasterpieceCount}`,
    `  Seam Type:    ${seam.seamType}`,
    `  Condition:    ${colorSeamCondition(seam.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatSeamsTable(seams) */
export function formatSeamsTable(seams: QuartzSeam[]): string {
  if (seams.length === 0) return chalk.dim('No quartz seams found')

  const lines: string[] = [chalk.bold('Quartz Seams'), '']

  for (const s of seams) {
    lines.push(
      `  ${chalk.rgb(180, 220, 240)(s.directory)}  ${colorScore(s.avgClarity)}  ${colorSeamCondition(s.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: QuartzMeridianStats): string {
  const lines: string[] = [
    chalk.bold('Quartz Meridian Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Seams:           ${stats.totalSeams}`,
    `  Avg Crystalline Clarity:${colorScore(stats.avgCrystallineClarity)}`,
    `  Avg Vibration Quality: ${colorScore(stats.avgVibrationQuality)}`,
    `  Avg Resonance Purity:  ${colorScore(stats.avgResonancePurity)}`,
    `  Avg Structure Strength:${colorScore(stats.avgStructureStrength)}`,
    `  Avg Vein Wisdom:       ${colorScore(stats.avgVeinWisdom)}`,
    `  Quartz Masterpieces:   ${stats.quartzMasterpieceCount}`,
    `  Crystal Veins:         ${stats.crystalVeinCount}`,
    `  Proper Minerals:       ${stats.properMineralCount}`,
    `  Dull Stones:           ${stats.dullStoneCount}`,
    `  Cracked Rocks:         ${stats.crackedRockCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Luminosity:    ${colorScore(stats.overallLuminosity)}`,
    `  Miner Grade:           ${stats.minerGrade}`,
    `  Best Crystal:          ${stats.bestCrystal || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Rhythmic:         ${stats.mostRhythmic || 'N/A'}`,
    `  Purest:                ${stats.purest || 'N/A'}`,
    `  Strongest:             ${stats.strongest || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
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
    formatSeamsTable(result.seams),
    '',
    chalk.bold('Geode Overview'),
    '',
    `  Avg Clarity:        ${colorScore(result.geode.avgClarity)}`,
    `  Avg Strength:       ${colorScore(result.geode.avgStrength)}`,
    `  Avg Wisdom:         ${colorScore(result.geode.avgWisdom)}`,
    `  Overall Luminosity: ${colorScore(result.geode.overallLuminosity)}`,
    `  Is Quartz:          ${result.geode.isQuartz ? chalk.rgb(180, 220, 240)('yes') : chalk.gray('no')}`,
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
