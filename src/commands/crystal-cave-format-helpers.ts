// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CaveCrystal, CaveSystem, CrystalCaveResult } from './crystal-cave-helpers.js'

// ─── Color Palette (crystal cave — teal/cyan) ────────────────────
const high = chalk.rgb(0, 200, 200)
const midHigh = chalk.rgb(40, 180, 190)
const mid = chalk.rgb(80, 160, 180)
const lowMid = chalk.rgb(120, 140, 170)
const low = chalk.rgb(160, 120, 160)

const best = chalk.rgb(0, 220, 210).bold
const good = chalk.rgb(30, 190, 195)
const okay = chalk.rgb(70, 165, 180)
const poor = chalk.rgb(120, 140, 165)
const worst = chalk.rgb(150, 125, 160)

const heading = chalk.rgb(0, 180, 190).bold
const label = chalk.rgb(50, 170, 185)
const dim = chalk.rgb(130, 150, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // teal
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
 * colorGrade('cathedral-cave') // best (bold teal)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'geode-perfect': best, 'perfect-drop': best, 'deep-cavern': best,
    'rainbow-cave': best, 'concert-hall': best, 'cathedral-cave': best,
    'mammoth-cave': best, 'spectacular-cave': best, 'master-spelunker': best,

    'crystal-growth': good, 'precise-point': good, 'proper-depth': good,
    'diverse-minerals': good, 'harmonic-chamber': good, 'crystal-grotto': good,
    'carlsbad-caverns': good, 'beautiful-grotto': good, 'expert-caver': good,

    'proper-formation': okay, 'decent-grotto': okay,
    'proper-variety': okay, 'proper-acoustics': okay, 'proper-cave': okay,
    'proper-system': okay, 'decent-cave': okay, 'skilled-explorer': okay,

    'rough-deposit': poor, 'irregular-drip': poor, 'shallow-cave': poor,
    'limited-types': poor, 'dead-room': poor, 'limestone-hollow': poor,
    'small-cave': poor, 'rough-hollow': poor, 'apprentice': poor,

    'shapeless': worst, 'broken-stalactite': worst, 'surface-hollow': worst,
    'monochrome': worst, 'echo-chamber': worst, 'mud-cave': worst,
    'rock-shelter': worst, 'collapsed': worst, 'novice': worst,

    'no-formation': worst, 'no-depth': worst,
    'no-variety': worst, 'silent': worst, 'no-cave': worst,
    'no-system': worst, 'filled-in': worst, 'surface-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Crystal Formatting ────────────────────────────────────────────

/**
 * Format a single crystal for display
 * @example
 * formatCrystalTable(crystal) // colored crystal info
 */
export function formatCrystalTable(crystal: CaveCrystal): string {
  const parts = [
    `${label('File:')} ${dim(crystal.file)}`,
    `${label('Formation Quality:')} ${colorScore(crystal.formationQuality)} ${colorGrade(crystal.forming.grade)}`,
    `${label('Stalactite Precision:')} ${colorScore(crystal.stalactitePrecision)} ${colorGrade(crystal.hanging.stalactite)}`,
    `${label('Grotto Depth:')} ${colorScore(crystal.grottoDepth)} ${colorGrade(crystal.deepening.grotto)}`,
    `${label('Mineral Diversity:')} ${colorScore(crystal.mineralDiversity)} ${colorGrade(crystal.diversifying.mineral)}`,
    `${label('Chamber Resonance:')} ${colorScore(crystal.chamberResonance)} ${colorGrade(crystal.resonating.chamber)}`,
    `${label('Score:')} ${colorScore(crystal.qualityScore)} ${colorGrade(crystal.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format crystals as summary table
 * @example
 * formatCrystalsTable(crystals) // multi-line table
 */
export function formatCrystalsTable(crystals: CaveCrystal[]): string {
  if (crystals.length === 0) return dim('No cave crystals found')
  const header = heading('Crystal Cave Analysis')
  const rows = crystals.map(c => formatCrystalTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── System Formatting ────────────────────────────────────────────

/**
 * Format a cave system for display
 * @example
 * formatSystemTable(system) // colored system info
 */
export function formatSystemTable(system: CaveSystem): string {
  const parts = [
    `${label('System:')} ${dim(system.directory)}`,
    `${label('Type:')} ${colorGrade(system.systemType)}`,
    `${label('Condition:')} ${colorGrade(system.condition)}`,
    `${label('Crystals:')} ${String(system.crystals.length)}`,
    `${label('Avg Formation:')} ${colorScore(system.avgFormation)}`,
    `${label('Avg Depth:')} ${colorScore(system.avgDepth)}`,
    `${label('Avg Resonance:')} ${colorScore(system.avgResonance)}`,
    `${label('Cathedral Caves:')} ${String(system.cathedralCaveCount)}`,
    `${label('No Cave:')} ${String(system.noCaveCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all systems as summary
 * @example
 * formatSystemsTable(systems) // multi-line system summary
 */
export function formatSystemsTable(systems: CaveSystem[]): string {
  if (systems.length === 0) return dim('No cave systems found')
  const header = heading('Cave Systems')
  const rows = systems.map(s => formatSystemTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CrystalCaveResult['stats']): string {
  const parts = [
    heading('Crystal Cave Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Systems:')} ${String(stats.totalSystems)}`,
    `${label('Avg Formation Quality:')} ${colorScore(stats.avgFormationQuality)}`,
    `${label('Avg Stalactite Precision:')} ${colorScore(stats.avgStalactitePrecision)}`,
    `${label('Avg Grotto Depth:')} ${colorScore(stats.avgGrottoDepth)}`,
    `${label('Avg Mineral Diversity:')} ${colorScore(stats.avgMineralDiversity)}`,
    `${label('Avg Chamber Resonance:')} ${colorScore(stats.avgChamberResonance)}`,
    `${label('Cathedral Caves:')} ${String(stats.cathedralCaveCount)}`,
    `${label('Crystal Grottos:')} ${String(stats.crystalGrottoCount)}`,
    `${label('Proper Caves:')} ${String(stats.properCaveCount)}`,
    `${label('Limestone Hollows:')} ${String(stats.limestoneHollowCount)}`,
    `${label('Mud Caves:')} ${String(stats.mudCaveCount)}`,
    `${label('No Cave:')} ${String(stats.noCaveCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Diversity:')} ${String(stats.hasHighDiversityCount)}`,
    `${label('High Resonance:')} ${String(stats.hasHighResonanceCount)}`,
    `${label('Overall Splendor:')} ${colorScore(stats.overallSplendor)}`,
    `${label('Explorer Grade:')} ${colorGrade(stats.explorerGrade)}`,
    `${label('Best Crystal:')} ${stats.bestCrystal}`,
    `${label('Best Formed:')} ${stats.bestFormed}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Most Diverse:')} ${stats.mostDiverse}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

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

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: CrystalCaveResult): string {
  const sections = [
    formatCrystalsTable(result.crystals),
    '',
    formatSystemsTable(result.systems),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Underground')} ${label('Deep:')} ${result.underground.isDeep ? high('Yes') : low('No')} ${label('Overall Splendor:')} ${colorScore(result.underground.overallSplendor)}`,
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
export function formatResultJson(result: CrystalCaveResult): string {
  return JSON.stringify(result, null, 2)
}
