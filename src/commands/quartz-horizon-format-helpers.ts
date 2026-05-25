// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { QuartzHorizonResult, QuartzCrystal, QuartzVein } from './quartz-horizon-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const QUARTZ = chalk.rgb(200, 210, 230)
const CRYSTAL = chalk.rgb(150, 200, 255)
const VEIN = chalk.rgb(180, 180, 210)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F48E}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return CRYSTAL.bold(String(score))
  if (score >= 60) return VEIN(String(score))
  if (score >= 40) return QUARTZ.bold(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('master-crystal')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('master') || grade.includes('flawless') || grade.includes('perfect') || grade.includes('crystal-clear') || grade.includes('hexagonal') || grade.includes('golden') || grade.includes('mother') || grade.includes('cathedral') || grade.includes('master-geologist')) return CRYSTAL.bold(grade)
  if (grade.includes('clear') || grade.includes('precise') || grade.includes('strong') || grade.includes('well-formed') || grade.includes('rich') || grade.includes('crystal-expert') || grade.includes('rich-vein') || grade.includes('gem-gallery')) return VEIN(grade)
  if (grade.includes('proper') || grade.includes('skilled-miner') || grade.includes('proper-seam') || grade.includes('proper-mine')) return QUARTZ.bold(grade)
  return DIM(grade)
}

// ─── Crystal Table ─────────────────────────────────────────────────

/**
 * @example formatCrystalTable(crystal)
 */
export function formatCrystalTable(crystal: QuartzCrystal): string {
  const lines: string[] = []
  lines.push(CRYSTAL.bold(`${BULLET} ${crystal.file}`))
  lines.push(`  Crystalline Clarity : ${colorScore(crystal.crystallineClarity)}  ${colorGrade(crystal.clarifying.crystal)}`)
  lines.push(`  Vibration Quality   : ${colorScore(crystal.vibrationQuality)}  ${colorGrade(crystal.resonating.frequency)}`)
  lines.push(`  Resonance Purity    : ${colorScore(crystal.resonancePurity)}  ${colorGrade(crystal.signaling.signal)}`)
  lines.push(`  Structure Strength  : ${colorScore(crystal.structureStrength)}  ${colorGrade(crystal.structuring.lattice)}`)
  lines.push(`  Vein Wisdom         : ${colorScore(crystal.veinWisdom)}  ${colorGrade(crystal.knowing.vein)}`)
  lines.push(`  Quality Score       : ${colorScore(crystal.qualityScore)}  ${colorGrade(crystal.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatCrystalsTable(crystals)
 */
export function formatCrystalsTable(crystals: QuartzCrystal[]): string {
  if (crystals.length === 0) return chalk.gray('No quartz crystals to display')
  return crystals.map(formatCrystalTable).join('\n\n')
}

// ─── Vein Table ────────────────────────────────────────────────────

/**
 * @example formatVeinTable(vein)
 */
export function formatVeinTable(vein: QuartzVein): string {
  const lines: string[] = []
  lines.push(CRYSTAL.bold(`${BULLET} ${vein.directory}`))
  lines.push(`  Crystals          : ${vein.crystals.length}`)
  lines.push(`  Avg Clarity       : ${colorScore(vein.avgClarity)}`)
  lines.push(`  Avg Strength      : ${colorScore(vein.avgStrength)}`)
  lines.push(`  Avg Wisdom        : ${colorScore(vein.avgWisdom)}`)
  lines.push(`  Master Crystals   : ${vein.masterCrystalCount}`)
  lines.push(`  Sand              : ${vein.sandCount}`)
  lines.push(`  Vein Type         : ${colorGrade(vein.veinType)}`)
  lines.push(`  Condition         : ${colorGrade(vein.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatVeinsTable(veins)
 */
export function formatVeinsTable(veins: QuartzVein[]): string {
  if (veins.length === 0) return chalk.gray('No quartz veins to display')
  return veins.map(formatVeinTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: QuartzHorizonResult['stats']): string {
  const lines: string[] = []
  lines.push(CRYSTAL.bold('Quartz Horizon Statistics'))
  lines.push(`  Total Files          : ${stats.totalFiles}`)
  lines.push(`  Total Veins          : ${stats.totalVeins}`)
  lines.push(`  Avg Crystalline Clarity : ${colorScore(stats.avgCrystallineClarity)}`)
  lines.push(`  Avg Vibration Quality   : ${colorScore(stats.avgVibrationQuality)}`)
  lines.push(`  Avg Resonance Purity    : ${colorScore(stats.avgResonancePurity)}`)
  lines.push(`  Avg Structure Strength  : ${colorScore(stats.avgStructureStrength)}`)
  lines.push(`  Avg Vein Wisdom         : ${colorScore(stats.avgVeinWisdom)}`)
  lines.push(`  Master Crystal       : ${stats.masterCrystalCount}`)
  lines.push(`  Clear Gem            : ${stats.clearGemCount}`)
  lines.push(`  Proper Quartz        : ${stats.properQuartzCount}`)
  lines.push(`  Milky Stone          : ${stats.milkyStoneCount}`)
  lines.push(`  Rough Rock           : ${stats.roughRockCount}`)
  lines.push(`  Sand                 : ${stats.sandCount}`)
  lines.push(`  Overall Purity       : ${colorScore(stats.overallPurity)}`)
  lines.push(`  Geologist Grade      : ${colorGrade(stats.geologistGrade)}`)
  lines.push(`  Best Crystal         : ${VEIN(stats.bestCrystal)}`)
  lines.push(`  Clearest             : ${VEIN(stats.clearest)}`)
  lines.push(`  Most Vibrant         : ${VEIN(stats.mostVibrant)}`)
  lines.push(`  Purest Signal        : ${VEIN(stats.purestSignal)}`)
  lines.push(`  Wisest               : ${VEIN(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${VEIN(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: QuartzHorizonResult): string {
  const sections: string[] = []

  sections.push(CRYSTAL.bold('Quartz Crystal Analysis'))
  sections.push(formatCrystalsTable(result.crystals))
  sections.push('')
  sections.push(CRYSTAL.bold('Quartz Veins'))
  sections.push(formatVeinsTable(result.veins))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(CRYSTAL.bold('Geology'))
  sections.push(`  Avg Clarity     : ${colorScore(result.geology.avgClarity)}`)
  sections.push(`  Avg Strength    : ${colorScore(result.geology.avgStrength)}`)
  sections.push(`  Avg Wisdom      : ${colorScore(result.geology.avgWisdom)}`)
  sections.push(`  Is Crystalline  : ${result.geology.isCrystalline ? CRYSTAL.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Purity  : ${colorScore(result.geology.overallPurity)}`)
  sections.push('')
  sections.push(CRYSTAL.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: QuartzHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
