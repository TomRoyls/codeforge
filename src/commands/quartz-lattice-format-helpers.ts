// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { QuartzCrystal, CrystalCave, QuartzLatticeResult } from './quartz-lattice-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(180, 220, 255)
const midHigh = chalk.rgb(150, 200, 240)
const mid = chalk.rgb(100, 160, 220)
const lowMid = chalk.rgb(80, 120, 180)
const low = chalk.rgb(60, 80, 140)

const best = chalk.rgb(200, 230, 255).bold
const good = chalk.rgb(150, 200, 240)
const okay = chalk.rgb(100, 160, 220)
const poor = chalk.rgb(80, 120, 180)
const worst = chalk.rgb(50, 60, 100)

const heading = chalk.rgb(180, 220, 255).bold
const label = chalk.rgb(150, 200, 240)
const dim = chalk.rgb(140, 160, 180)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // icy blue
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('perfect-crystal') // best (icy bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'perfect-crystal': best, 'brilliant-cut': best, 'diamond-lattice': best,
    'total-internal-reflection': best, 'hyper-responsive': best, 'flawless-gem': best,
    'crystal-cathedral': best, 'treasure-trove': best, 'master-gemologist': best,

    'high-grade-quartz': good, 'ideal-cut': good, 'strong-lattice': good,
    'high-refraction': good, 'highly-reactive': good, 'high-grade-crystal': good,
    'geode-chamber': good, 'gem-mine': good, 'expert-crystallographer': good,

    'proper-crystal': okay, 'proper-facet': okay, 'proper-bonds': okay,
    'proper-refraction': okay, 'proper-response': okay, 'proper-quartz': okay,
    'quartz-vein': okay, 'quartz-quarry': okay, 'skilled-mineralogist': okay,

    'cloudy-quartz': poor, 'rough-cut': poor, 'weak-bonds': poor,
    'low-refraction': poor, 'slow-response': poor, 'cloudy-mineral': poor,
    'rocky-cave': poor, 'rocky-mine': poor, 'apprentice': poor,

    'fractured-crystal': worst, 'uncut': worst, 'micro-fractures': worst,
    'opaque': worst, 'delayed': worst, 'cracked-stone': worst,
    'gravel-pit': worst, 'spent-mine': worst, 'rock-hound': worst,

    'shattered': worst, 'chipped': worst, 'broken-lattice': worst,
    'black-body': worst, 'inert': worst, 'gravel': worst,
    'empty-shaft': worst, 'caved-in': worst, 'coal-miner': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Crystal Formatting ────────────────────────────────────────────

/**
 * Format a single crystal for display
 * @example
 * formatCrystalTable(crystal) // colored crystal info
 */
export function formatCrystalTable(crystal: QuartzCrystal): string {
  const parts = [
    `${label('File:')} ${dim(crystal.file)}`,
    `${label('Crystalline Structure:')} ${colorScore(crystal.crystallineStructure)} ${colorGrade(crystal.structuring.grade)}`,
    `${label('Facet Quality:')} ${colorScore(crystal.facetQuality)} ${colorGrade(crystal.faceting.cut)}`,
    `${label('Lattice Strength:')} ${colorScore(crystal.latticeStrength)} ${colorGrade(crystal.strengthening.lattice)}`,
    `${label('Refraction Index:')} ${colorScore(crystal.refractionIndex)} ${colorGrade(crystal.refracting.index)}`,
    `${label('Piezoelectric Response:')} ${colorScore(crystal.piezoelectricResponse)} ${colorGrade(crystal.responding.response)}`,
    `${label('Score:')} ${colorScore(crystal.qualityScore)} ${colorGrade(crystal.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format crystals as summary table
 * @example
 * formatCrystalsTable(crystals) // multi-line table
 */
export function formatCrystalsTable(crystals: QuartzCrystal[]): string {
  if (crystals.length === 0) return dim('No quartz crystals found')
  const header = heading('Quartz Crystal Analysis')
  const rows = crystals.map(c => formatCrystalTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Cave Formatting ───────────────────────────────────────────────

/**
 * Format a cave for display
 * @example
 * formatCaveTable(cave) // colored cave info
 */
export function formatCaveTable(cave: CrystalCave): string {
  const parts = [
    `${label('Cave:')} ${dim(cave.directory)}`,
    `${label('Type:')} ${colorGrade(cave.caveType)}`,
    `${label('Condition:')} ${colorGrade(cave.condition)}`,
    `${label('Crystals:')} ${String(cave.crystals.length)}`,
    `${label('Avg Regularity:')} ${colorScore(cave.avgRegularity)}`,
    `${label('Avg Strength:')} ${colorScore(cave.avgStrength)}`,
    `${label('Avg Clarity:')} ${colorScore(cave.avgClarity)}`,
    `${label('Flawless Gems:')} ${String(cave.flawlessGemCount)}`,
    `${label('Gravel:')} ${String(cave.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all caves as summary
 * @example
 * formatCavesTable(caves) // multi-line cave summary
 */
export function formatCavesTable(caves: CrystalCave[]): string {
  if (caves.length === 0) return dim('No crystal caves found')
  const header = heading('Crystal Cave Analysis')
  const rows = caves.map(c => formatCaveTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: QuartzLatticeResult['stats']): string {
  const parts = [
    heading('Formation Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Caves:')} ${String(stats.totalCaves)}`,
    `${label('Avg Crystalline Structure:')} ${colorScore(stats.avgCrystallineStructure)}`,
    `${label('Avg Facet Quality:')} ${colorScore(stats.avgFacetQuality)}`,
    `${label('Avg Lattice Strength:')} ${colorScore(stats.avgLatticeStrength)}`,
    `${label('Avg Refraction Index:')} ${colorScore(stats.avgRefractionIndex)}`,
    `${label('Avg Piezoelectric Response:')} ${colorScore(stats.avgPiezoelectricResponse)}`,
    `${label('Flawless Gems:')} ${String(stats.flawlessGemCount)}`,
    `${label('High-Grade Crystals:')} ${String(stats.highGradeCrystalCount)}`,
    `${label('Proper Quartz:')} ${String(stats.properQuartzCount)}`,
    `${label('Cloudy Minerals:')} ${String(stats.cloudyMineralCount)}`,
    `${label('Cracked Stones:')} ${String(stats.crackedStoneCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Regularity:')} ${String(stats.hasHighRegularityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Reactivity:')} ${String(stats.hasHighReactivityCount)}`,
    `${label('Overall Purity:')} ${colorScore(stats.overallPurity)}`,
    `${label('Gemologist Grade:')} ${colorGrade(stats.gemologistGrade)}`,
    `${label('Best Crystal:')} ${stats.bestCrystal}`,
    `${label('Most Regular:')} ${stats.mostRegular}`,
    `${label('Best Faceted:')} ${stats.bestFaceted}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Clearest:')} ${stats.clearest}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: QuartzLatticeResult): string {
  const sections = [
    formatCrystalsTable(result.crystals),
    '',
    formatCavesTable(result.caves),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Formation')} ${label('Crystalline:')} ${result.formation.isCrystalline ? high('Yes') : low('No')} ${label('Overall Purity:')} ${colorScore(result.formation.overallPurity)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: QuartzLatticeResult): string {
  return JSON.stringify(result, null, 2)
}
