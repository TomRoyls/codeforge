import chalk from 'chalk'
import type {
  TreeCrown,
  ForestStand,
  EcosystemMeasure,
  ForestCanopyStats,
  ForestCanopyResult,
  ForestCondition,
  StandType,
  StandCondition,
  EcologistGrade,
} from './forest-canopy-helpers.js'

const conditionColor: Record<ForestCondition, (t: string) => string> = {
  'old-growth-forest': (t: string) => chalk.rgb(46, 204, 113)(t),
  'healthy-forest': (t: string) => chalk.rgb(52, 152, 219)(t),
  'secondary-forest': (t: string) => chalk.rgb(241, 196, 15)(t),
  'plantation': (t: string) => chalk.rgb(230, 126, 34)(t),
  'clear-cut': (t: string) => chalk.rgb(231, 76, 60)(t),
  'desert': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const standTypeColor: Record<StandType, (t: string) => string> = {
  'ancient-woodland': (t: string) => chalk.rgb(46, 204, 113)(t),
  'nature-reserve': (t: string) => chalk.rgb(52, 152, 219)(t),
  'managed-forest': (t: string) => chalk.rgb(241, 196, 15)(t),
  'plantation': (t: string) => chalk.rgb(230, 126, 34)(t),
  'scrubland': (t: string) => chalk.rgb(231, 76, 60)(t),
  'wasteland': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const standCondColor: Record<StandCondition, (t: string) => string> = {
  'primeval-forest': (t: string) => chalk.rgb(46, 204, 113)(t),
  'healthy-ecosystem': (t: string) => chalk.rgb(52, 152, 219)(t),
  'functioning-forest': (t: string) => chalk.rgb(241, 196, 15)(t),
  'degraded-woodland': (t: string) => chalk.rgb(230, 126, 34)(t),
  'barren-land': (t: string) => chalk.rgb(231, 76, 60)(t),
  'desert': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const gradeColor: Record<EcologistGrade, (t: string) => string> = {
  'chief-ecologist': (t: string) => chalk.rgb(46, 204, 113)(t),
  'forest-ecologist': (t: string) => chalk.rgb(52, 152, 219)(t),
  'botanist': (t: string) => chalk.rgb(241, 196, 15)(t),
  'gardener': (t: string) => chalk.rgb(230, 126, 34)(t),
  'logger': (t: string) => chalk.rgb(231, 76, 60)(t),
  'arsonist': (t: string) => chalk.rgb(142, 68, 173)(t),
}

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

/**
 * Format crowns as a table
 * @example
 * formatCrownTable(crowns) // formatted string
 */
export function formatCrownTable(crowns: TreeCrown[]): string {
  if (crowns.length === 0) return chalk.rgb(150, 150, 150)('  No tree crowns to display')
  const rows = crowns.map(c => {
    const cond = conditionColor[c.condition](c.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(c.file.padEnd(30)), scoreBar(c.qualityScore, 10), cond].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('File'.padEnd(30)), chalk.rgb(100, 200, 255)('Health'.padEnd(24)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format stands as a table
 * @example
 * formatStandTable(stands) // formatted string
 */
export function formatStandTable(stands: ForestStand[]): string {
  if (stands.length === 0) return chalk.rgb(150, 150, 150)('  No forest stands to display')
  const rows = stands.map(s => {
    const st = standTypeColor[s.standType](s.standType.padEnd(20))
    const sc = standCondColor[s.condition](s.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(s.directory.padEnd(20)), chalk.rgb(200, 200, 200)(String(s.crowns.length).padEnd(6)), scoreBar(s.avgCanopyDensity, 10), st, sc].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('Directory'.padEnd(20)), chalk.rgb(100, 200, 255)('Files'.padEnd(6)), chalk.rgb(100, 200, 255)('Avg Health'.padEnd(24)), chalk.rgb(100, 200, 255)('Type'.padEnd(20)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format ecosystem summary
 * @example
 * formatEcosystem(ecosystem) // formatted string
 */
export function formatEcosystem(ecosystem: EcosystemMeasure): string {
  const healthy = ecosystem.isHealthy ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Ecosystem Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Health:      ${scoreBar(ecosystem.overallHealth)}`,
    `  Avg Canopy Density:  ${scoreBar(ecosystem.avgCanopyDensity)}`,
    `  Avg Biodiversity:    ${scoreBar(ecosystem.avgBiodiversity)}`,
    `  Avg Light:           ${scoreBar(ecosystem.avgLightPenetration)}`,
    `  Is Healthy:          ${healthy}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

/**
 * Format statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: ForestCanopyStats): string {
  const grade = gradeColor[stats.ecologistGrade](stats.ecologistGrade)
  return [
    '', chalk.rgb(100, 200, 255)('  Forest Canopy Statistics'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Stands:         ${chalk.rgb(200, 200, 200)(String(stats.totalStands))}`,
    `  Ecologist Grade:      ${grade}`,
    '', `  Avg Canopy Density:   ${scoreBar(stats.avgCanopyDensity)}`,
    `  Avg Understory:       ${scoreBar(stats.avgUnderstoryHealth)}`,
    `  Avg Floor Vitality:   ${scoreBar(stats.avgForestFloorVitality)}`,
    `  Avg Root Depth:       ${scoreBar(stats.avgRootSystemDepth)}`,
    `  Avg Biodiversity:     ${scoreBar(stats.avgBiodiversity)}`,
    `  Avg Light:            ${scoreBar(stats.avgLightPenetration)}`,
    '', `  Old Growth Forest:    ${chalk.rgb(46, 204, 113)(String(stats.oldGrowthForestCount))}`,
    `  Healthy Forest:       ${chalk.rgb(52, 152, 219)(String(stats.healthyForestCount))}`,
    `  Secondary Forest:     ${chalk.rgb(241, 196, 15)(String(stats.secondaryForestCount))}`,
    `  Plantation:           ${chalk.rgb(230, 126, 34)(String(stats.plantationCount))}`,
    `  Clear Cut:            ${chalk.rgb(231, 76, 60)(String(stats.clearCutCount))}`,
    `  Desert:               ${chalk.rgb(142, 68, 173)(String(stats.desertCount))}`,
    '', `  Dense Canopy:         ${chalk.rgb(200, 200, 200)(String(stats.denseCanopyCount))}`,
    `  Has Gaps:             ${chalk.rgb(200, 200, 200)(String(stats.hasGapsCount))}`,
    `  Has Vines:            ${chalk.rgb(200, 200, 200)(String(stats.hasVinesCount))}`,
    `  Is Fertile:           ${chalk.rgb(200, 200, 200)(String(stats.isFertileCount))}`,
    `  Has Tap Root:         ${chalk.rgb(200, 200, 200)(String(stats.hasTapRootCount))}`,
    `  Has Mycorrhizae:      ${chalk.rgb(200, 200, 200)(String(stats.hasMycorrhizaeCount))}`,
    '', `  Is Diverse:           ${chalk.rgb(200, 200, 200)(String(stats.isDiverseCount))}`,
    `  Is Monoculture:       ${chalk.rgb(200, 200, 200)(String(stats.isMonocultureCount))}`,
    `  Has Invasive:         ${chalk.rgb(200, 200, 200)(String(stats.hasInvasiveCount))}`,
    `  Is Well Lit:          ${chalk.rgb(200, 200, 200)(String(stats.isWellLitCount))}`,
    `  Is Shadowed:          ${chalk.rgb(200, 200, 200)(String(stats.isShadowedCount))}`,
    `  Is Mature:            ${chalk.rgb(200, 200, 200)(String(stats.isMatureCount))}`,
    `  Is Growing:           ${chalk.rgb(200, 200, 200)(String(stats.isGrowingCount))}`,
    '', `  Healthiest Tree:      ${chalk.rgb(46, 204, 113)(stats.healthiestTree)}`,
    `  Deepest Roots:        ${chalk.rgb(46, 204, 113)(stats.deepestRoots)}`,
    `  Most Diverse:         ${chalk.rgb(46, 204, 113)(stats.mostDiverse)}`,
    `  Best Lit:             ${chalk.rgb(46, 204, 113)(stats.bestLit)}`,
    `  Most Mature:          ${chalk.rgb(46, 204, 113)(stats.mostMature)}`,
    '',
  ].join('\n')
}

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - the forest is thriving')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

/**
 * Format complete report
 * @example
 * formatForestCanopyReport(result) // formatted string
 */
export function formatForestCanopyReport(result: ForestCanopyResult): string {
  return [formatEcosystem(result.ecosystem), formatCrownTable(result.crowns), '', formatStandTable(result.stands), formatStats(result.stats), formatRecommendations(result.recommendations)].join('\n')
}

/**
 * Format result as JSON
 * @example
 * formatForestCanopyJSON(result) // JSON string
 */
export function formatForestCanopyJSON(result: ForestCanopyResult): string {
  return JSON.stringify(result, null, 2)
}
