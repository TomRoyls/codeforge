// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CelestialBloom, GardenConstellation, CosmicGardenResult } from './cosmic-garden-helpers.js'

// ─── Color Palette (cosmic garden — green/gold/cosmic purple) ──────
const high = chalk.rgb(100, 220, 120)
const midHigh = chalk.rgb(140, 200, 110)
const mid = chalk.rgb(180, 180, 100)
const lowMid = chalk.rgb(200, 160, 90)
const low = chalk.rgb(220, 140, 80)

const best = chalk.rgb(80, 240, 130).bold
const good = chalk.rgb(120, 210, 120)
const okay = chalk.rgb(160, 190, 110)
const poor = chalk.rgb(190, 165, 100)
const worst = chalk.rgb(210, 145, 90)

const heading = chalk.rgb(90, 230, 125).bold
const label = chalk.rgb(130, 200, 115)
const dim = chalk.rgb(170, 175, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // vibrant green
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
 * colorGrade('celestial-tree') // best (bold green)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'evergreen-cosmos': best, 'deep-cosmic-root': best, 'rainbow-garden': best,
    'universal-accord': best, 'golden-bounty': best, 'celestial-tree': best,
    'hanging-gardens': best, 'eden-reborn': best, 'cosmic-gardener': best,

    'thriving-growth': good, 'strong-taproot': good, 'diverse-bed': good,
    'cosmic-rhythm': good, 'rich-harvest': good, 'cosmic-rose': good,
    'cosmic-greenhouse': good, 'flourishing-realm': good, 'master-botanist': good,

    'proper-sprout': okay, 'proper-roots': okay, 'proper-variety': okay,
    'proper-harmony': okay, 'proper-yield': okay, 'proper-plant': okay,
    'proper-garden': okay, 'decent-garden': okay, 'skilled-cultivator': okay,

    'wilting-plant': poor, 'shallow-roots': poor, 'monoculture': poor,
    'discordant-notes': poor, 'meager-crop': poor, 'wilting-sprout': poor,
    'wild-patch': poor, 'struggling-patch': poor, 'apprentice': poor,

    'barren-soil': worst, 'surface-sprouts': worst, 'single-stem': worst,
    'cacophony': worst, 'failed-harvest': worst, 'dried-seed': worst,
    'barren-field': worst, 'wasteland': worst, 'novice': worst,

    'dead-seed': worst, 'no-roots': worst, 'no-bloom': worst,
    'silence': worst, 'no-harvest': worst, 'void-spore': worst,
    'no-garden': worst, 'void': worst, 'brown-thumb': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Bloom Formatting ─────────────────────────────────────────────

/**
 * Format a single bloom for display
 * @example
 * formatBloomTable(bloom) // colored bloom info
 */
export function formatBloomTable(bloom: CelestialBloom): string {
  const parts = [
    `${label('File:')} ${dim(bloom.file)}`,
    `${label('Growth Vitality:')} ${colorScore(bloom.growthVitality)} ${colorGrade(bloom.growing.grade)}`,
    `${label('Root Depth:')} ${colorScore(bloom.rootDepth)} ${colorGrade(bloom.rooting.root)}`,
    `${label('Bloom Diversity:')} ${colorScore(bloom.bloomDiversity)} ${colorGrade(bloom.blooming.bloom)}`,
    `${label('Celestial Harmony:')} ${colorScore(bloom.celestialHarmony)} ${colorGrade(bloom.harmonizing.celestial)}`,
    `${label('Harvest Quality:')} ${colorScore(bloom.harvestQuality)} ${colorGrade(bloom.harvesting.harvest)}`,
    `${label('Score:')} ${colorScore(bloom.qualityScore)} ${colorGrade(bloom.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format blooms as summary table
 * @example
 * formatBloomsTable(blooms) // multi-line table
 */
export function formatBloomsTable(blooms: CelestialBloom[]): string {
  if (blooms.length === 0) return dim('No celestial blooms found')
  const header = heading('Cosmic Garden Analysis')
  const rows = blooms.map(b => formatBloomTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Constellation Formatting ─────────────────────────────────────

/**
 * Format a constellation for display
 * @example
 * formatConstellationTable(constellation) // colored constellation info
 */
export function formatConstellationTable(constellation: GardenConstellation): string {
  const parts = [
    `${label('Constellation:')} ${dim(constellation.directory)}`,
    `${label('Type:')} ${colorGrade(constellation.constellationType)}`,
    `${label('Condition:')} ${colorGrade(constellation.condition)}`,
    `${label('Blooms:')} ${String(constellation.blooms.length)}`,
    `${label('Avg Vitality:')} ${colorScore(constellation.avgVitality)}`,
    `${label('Avg Depth:')} ${colorScore(constellation.avgDepth)}`,
    `${label('Avg Harmony:')} ${colorScore(constellation.avgHarmony)}`,
    `${label('Celestial Trees:')} ${String(constellation.celestialTreeCount)}`,
    `${label('Void Spores:')} ${String(constellation.voidSporeCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all constellations as summary
 * @example
 * formatConstellationsTable(constellations) // multi-line summary
 */
export function formatConstellationsTable(constellations: GardenConstellation[]): string {
  if (constellations.length === 0) return dim('No garden constellations found')
  const header = heading('Garden Constellations')
  const rows = constellations.map(c => formatConstellationTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CosmicGardenResult['stats']): string {
  const parts = [
    heading('Cosmic Garden Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Constellations:')} ${String(stats.totalConstellations)}`,
    `${label('Avg Growth Vitality:')} ${colorScore(stats.avgGrowthVitality)}`,
    `${label('Avg Root Depth:')} ${colorScore(stats.avgRootDepth)}`,
    `${label('Avg Bloom Diversity:')} ${colorScore(stats.avgBloomDiversity)}`,
    `${label('Avg Celestial Harmony:')} ${colorScore(stats.avgCelestialHarmony)}`,
    `${label('Avg Harvest Quality:')} ${colorScore(stats.avgHarvestQuality)}`,
    `${label('Celestial Trees:')} ${String(stats.celestialTreeCount)}`,
    `${label('Cosmic Roses:')} ${String(stats.cosmicRoseCount)}`,
    `${label('Proper Plants:')} ${String(stats.properPlantCount)}`,
    `${label('Wilting Sprouts:')} ${String(stats.wiltingSproutCount)}`,
    `${label('Dried Seeds:')} ${String(stats.driedSeedCount)}`,
    `${label('Void Spores:')} ${String(stats.voidSporeCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Diversity:')} ${String(stats.hasHighDiversityCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('Overall Fertility:')} ${colorScore(stats.overallFertility)}`,
    `${label('Gardener Grade:')} ${colorGrade(stats.gardenerGrade)}`,
    `${label('Best Bloom:')} ${stats.bestBloom}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Deepest Rooted:')} ${stats.deepestRooted}`,
    `${label('Most Diverse:')} ${stats.mostDiverse}`,
    `${label('Most Harmonious:')} ${stats.mostHarmonious}`,
  ]
  return parts.join('\n')
}

// ─── Celebration Formatting ────────────────────────────────────────

/**
 * Format celebration info
 * @example
 * formatCelebration(celebration) // milestone banner
 */
export function formatCelebration(celebration: CosmicGardenResult['celebration']): string {
  const parts = [
    heading(`\u{1F33F} Milestone #${String(celebration.milestone)}: ${celebration.name}`),
    `${label('Message:')} ${celebration.message}`,
    `${label('Previous Milestones:')} ${celebration.previousMilestones.map(String).join(', ')}`,
    `${label('Total Tests:')} ${String(celebration.totalTests)}+`,
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
export function formatResultTable(result: CosmicGardenResult): string {
  const sections = [
    formatCelebration(result.celebration),
    '',
    formatBloomsTable(result.blooms),
    '',
    formatConstellationsTable(result.constellations),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Garden')} ${label('Flourishing:')} ${result.garden.isFlourishing ? high('Yes') : low('No')} ${label('Overall Fertility:')} ${colorScore(result.garden.overallFertility)}`,
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
export function formatResultJson(result: CosmicGardenResult): string {
  return JSON.stringify(result, null, 2)
}
