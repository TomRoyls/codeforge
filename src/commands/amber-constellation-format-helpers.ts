// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AmberStar, AmberGalaxy, AmberConstellationResult } from './amber-constellation-helpers.js'

// ─── Color Palette (amber constellation — golden/amber/warm) ──────
const high = chalk.rgb(255, 215, 120)
const midHigh = chalk.rgb(235, 195, 100)
const mid = chalk.rgb(215, 175, 80)
const lowMid = chalk.rgb(190, 150, 60)
const low = chalk.rgb(165, 125, 40)

const best = chalk.rgb(255, 230, 150).bold
const good = chalk.rgb(240, 200, 120)
const okay = chalk.rgb(220, 180, 100)
const poor = chalk.rgb(195, 155, 75)
const worst = chalk.rgb(170, 130, 50)

const heading = chalk.rgb(250, 220, 140).bold
const label = chalk.rgb(230, 195, 110)
const dim = chalk.rgb(210, 175, 90)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // golden amber
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
 * colorGrade('golden-constellation') // best (bold golden)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'golden-constellation': best, 'perfect-amber': best, 'celestial-map': best,
    'blazing-star': best, 'grand-pattern': best, 'deep-space': best,
    'milky-way': best, 'golden-universe': best, 'master-astronomer': best,

    'amber-sky': good, 'clear-resin': good, 'star-chart': good,
    'bright-sun': good, 'recognized-constellation': good, 'galactic-depth': good,
    'spiral-galaxy': good, 'amber-cosmos': good, 'expert-observer': good,

    'starlit-night': okay, 'proper-preservation': okay, 'proper-atlas': okay,
    'proper-light': okay, 'proper-shape': okay, 'proper-universe': okay,
    'proper-nebula': okay, 'starry-realm': okay, 'skilled-stargazer': okay,

    'cloudy-sky': poor, 'cloudy-amber': poor, 'rough-sketch': poor,
    'dim-star': poor, 'loose-grouping': poor, 'shallow-orbit': poor,
    'star-cluster': poor, 'dim-space': poor, 'apprentice': poor,

    'dark-night': worst, 'cracked-resin': worst, 'scattered-dots': worst,
    'dark-body': worst, 'random-stars': worst, 'surface-level': worst,
    'dark-cloud': worst, 'dark-void': worst, 'novice': worst,

    'void': worst, 'no-preservation': worst, 'no-pattern': worst,
    'no-light': worst, 'no-connection': worst, 'no-depth': worst,
    'no-galaxy': worst, 'blind': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Star Formatting ──────────────────────────────────────────────

/**
 * Format a single amber star for display
 * @example
 * formatStarTable(star) // colored star info
 */
export function formatStarTable(star: AmberStar): string {
  const parts = [
    `${label('File:')} ${dim(star.file)}`,
    `${label('Preservation Quality:')} ${colorScore(star.preservationQuality)} ${colorGrade(star.preserving.grade)}`,
    `${label('Stellar Organization:')} ${colorScore(star.stellarOrganization)} ${colorGrade(star.organizing.pattern)}`,
    `${label('Star Clarity:')} ${colorScore(star.starClarity)} ${colorGrade(star.clarifying.brightness)}`,
    `${label('Constellation Coherence:')} ${colorScore(star.constellationCoherence)} ${colorGrade(star.connecting.constellation)}`,
    `${label('Cosmic Depth:')} ${colorScore(star.cosmicDepth)} ${colorGrade(star.deepening.cosmos)}`,
    `${label('Score:')} ${colorScore(star.qualityScore)} ${colorGrade(star.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format stars as summary table
 * @example
 * formatStarsTable(stars) // multi-line table
 */
export function formatStarsTable(stars: AmberStar[]): string {
  if (stars.length === 0) return dim('No amber stars found')
  const header = heading('Amber Star Analysis')
  const rows = stars.map(st => formatStarTable(st))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Galaxy Formatting ────────────────────────────────────────────

/**
 * Format a single amber galaxy for display
 * @example
 * formatGalaxyTable(galaxy) // colored galaxy info
 */
export function formatGalaxyTable(galaxy: AmberGalaxy): string {
  const parts = [
    `${label('Galaxy:')} ${dim(galaxy.directory)}`,
    `${label('Type:')} ${colorGrade(galaxy.galaxyType)}`,
    `${label('Condition:')} ${colorGrade(galaxy.condition)}`,
    `${label('Stars:')} ${String(galaxy.stars.length)}`,
    `${label('Avg Preservation:')} ${colorScore(galaxy.avgPreservation)}`,
    `${label('Avg Organization:')} ${colorScore(galaxy.avgOrganization)}`,
    `${label('Avg Clarity:')} ${colorScore(galaxy.avgClarity)}`,
    `${label('Golden Constellations:')} ${String(galaxy.goldenConstellationCount)}`,
    `${label('Void Count:')} ${String(galaxy.voidCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all amber galaxies as summary
 * @example
 * formatGalaxiesTable(galaxies) // multi-line summary
 */
export function formatGalaxiesTable(galaxies: AmberGalaxy[]): string {
  if (galaxies.length === 0) return dim('No amber galaxies found')
  const header = heading('Amber Galaxies')
  const rows = galaxies.map(g => formatGalaxyTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AmberConstellationResult['stats']): string {
  const parts = [
    heading('Amber Constellation Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Galaxies:')} ${String(stats.totalGalaxies)}`,
    `${label('Avg Preservation Quality:')} ${colorScore(stats.avgPreservationQuality)}`,
    `${label('Avg Stellar Organization:')} ${colorScore(stats.avgStellarOrganization)}`,
    `${label('Avg Star Clarity:')} ${colorScore(stats.avgStarClarity)}`,
    `${label('Avg Constellation Coherence:')} ${colorScore(stats.avgConstellationCoherence)}`,
    `${label('Avg Cosmic Depth:')} ${colorScore(stats.avgCosmicDepth)}`,
    `${label('Golden Constellation:')} ${String(stats.goldenConstellationCount)}`,
    `${label('Amber Sky:')} ${String(stats.amberSkyCount)}`,
    `${label('Starlit Night:')} ${String(stats.starlitNightCount)}`,
    `${label('Cloudy Sky:')} ${String(stats.cloudySkyCount)}`,
    `${label('Dark Night:')} ${String(stats.darkNightCount)}`,
    `${label('Void:')} ${String(stats.voidCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Organization:')} ${String(stats.hasHighOrganizationCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Coherence:')} ${String(stats.hasHighCoherenceCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('Overall Luminosity:')} ${colorScore(stats.overallLuminosity)}`,
    `${label('Astronomer Grade:')} ${colorGrade(stats.astronomerGrade)}`,
    `${label('Best Star:')} ${stats.bestStar}`,
    `${label('Most Preserved:')} ${stats.mostPreserved}`,
    `${label('Most Organized:')} ${stats.mostOrganized}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Deepest:')} ${stats.deepest}`,
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
  const items = recommendations.map(r => `${dim('\u2B50')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: AmberConstellationResult): string {
  const sections = [
    formatStarsTable(result.stars),
    '',
    formatGalaxiesTable(result.galaxies),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Cosmos')} ${label('Golden:')} ${result.cosmos.isGolden ? high('Yes') : low('No')} ${label('Overall Luminosity:')} ${colorScore(result.cosmos.overallLuminosity)}`,
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
export function formatResultJson(result: AmberConstellationResult): string {
  return JSON.stringify(result, null, 2)
}
