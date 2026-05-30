import chalk from 'chalk'

import type { GardenCondition, EmeraldGarden, EmeraldRay, EmeraldSunriseResult, RayCondition } from './emerald-sunrise-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 75) return chalk.rgb(39, 174, 96)(String(score))
  if (score >= 60) return chalk.rgb(34, 153, 84)(String(score))
  if (score >= 40) return chalk.rgb(30, 130, 76)(String(score))
  if (score >= 20) return chalk.rgb(25, 107, 68)(String(score))
  return chalk.gray(String(score))
}

/** @example colorRayCondition('emerald-masterpiece') */
export function colorRayCondition(condition: RayCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece':
      return chalk.rgb(46, 204, 113)('emerald-masterpiece')
    case 'dawn-jewel':
      return chalk.rgb(39, 174, 96)('dawn-jewel')
    case 'proper-gem':
      return chalk.rgb(34, 153, 84)('proper-gem')
    case 'cloudy-stone':
      return chalk.rgb(30, 130, 76)('cloudy-stone')
    case 'dull-rock':
      return chalk.rgb(25, 107, 68)('dull-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGardenCondition('emerald-paradise') */
export function colorGardenCondition(condition: GardenCondition | string): string {
  switch (condition) {
    case 'emerald-paradise':
      return chalk.rgb(46, 204, 113)('emerald-paradise')
    case 'jade-oasis':
      return chalk.rgb(39, 174, 96)('jade-oasis')
    case 'proper-greenhouse':
      return chalk.rgb(34, 153, 84)('proper-greenhouse')
    case 'weed-patch':
      return chalk.rgb(30, 130, 76)('weed-patch')
    case 'desert':
      return chalk.rgb(25, 107, 68)('desert')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatRayTable(ray) */
export function formatRayTable(ray: EmeraldRay): string {
  const lines: string[] = [
    chalk.bold(`Emerald Ray: ${ray.file}`),
    '',
    `  Green Vitality:      ${colorScore(ray.greenVitality)}  ${chalk.dim(`(${ray.thriving.growth})`)}`,
    `  Dawn Clarity:        ${colorScore(ray.dawnClarity)}  ${chalk.dim(`(${ray.illuminating.dawn})`)}`,
    `  Gem Wisdom:          ${colorScore(ray.gemWisdom)}  ${chalk.dim(`(${ray.accumulating.gem})`)}`,
    `  Morning Freshness:   ${colorScore(ray.morningFreshness)}  ${chalk.dim(`(${ray.refreshing.dew})`)}`,
    `  Sunrise Resilience:  ${colorScore(ray.sunriseResilience)}  ${chalk.dim(`(${ray.rising.sunrise})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${colorRayCondition(ray.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: EmeraldRay[]): string {
  if (rays.length === 0) return chalk.dim('No emerald rays found')

  const colWidths = {
    file: Math.max(4, ...rays.map((r) => r.file.length)),
    vit: Math.max(4, ...rays.map((r) => String(r.greenVitality).length)),
    clr: Math.max(4, ...rays.map((r) => String(r.dawnClarity).length)),
    wis: Math.max(4, ...rays.map((r) => String(r.gemWisdom).length)),
    frs: Math.max(4, ...rays.map((r) => String(r.morningFreshness).length)),
    res: Math.max(4, ...rays.map((r) => String(r.sunriseResilience).length)),
    score: Math.max(5, ...rays.map((r) => String(r.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Emerald Rays'), '']

  const header =
    chalk.rgb(46, 204, 113)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Vit', colWidths.vit)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Frs', colWidths.frs)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(46, 204, 113)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const r of rays) {
    lines.push(
      padRight(r.file, colWidths.file) +
        '  ' +
        padLeft(String(r.greenVitality), colWidths.vit) +
        '  ' +
        padLeft(String(r.dawnClarity), colWidths.clr) +
        '  ' +
        padLeft(String(r.gemWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(r.morningFreshness), colWidths.frs) +
        '  ' +
        padLeft(String(r.sunriseResilience), colWidths.res) +
        '  ' +
        padLeft(String(r.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatGardenTable(garden) */
export function formatGardenTable(garden: EmeraldGarden): string {
  const lines: string[] = [
    chalk.bold(`Emerald Garden: ${garden.directory}`),
    '',
    `  Rays:               ${garden.rays.length}`,
    `  Avg Vitality:       ${colorScore(garden.avgVitality)}`,
    `  Avg Clarity:        ${colorScore(garden.avgClarity)}`,
    `  Avg Wisdom:         ${colorScore(garden.avgWisdom)}`,
    `  Masterpieces:       ${garden.emeraldMasterpieceCount}`,
    `  Garden Type:        ${garden.gardenType}`,
    `  Condition:          ${colorGardenCondition(garden.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGardensTable(gardens) */
export function formatGardensTable(gardens: EmeraldGarden[]): string {
  if (gardens.length === 0) return chalk.dim('No emerald gardens found')

  const lines: string[] = [chalk.bold('Emerald Gardens'), '']

  for (const g of gardens) {
    lines.push(
      `  ${chalk.rgb(46, 204, 113)(g.directory)}  ${colorScore(g.avgVitality)}  ${colorGardenCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldSunriseResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Sunrise Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Gardens:         ${stats.totalGardens}`,
    `  Avg Green Vitality:    ${colorScore(stats.avgGreenVitality)}`,
    `  Avg Dawn Clarity:      ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Gem Wisdom:        ${colorScore(stats.avgGemWisdom)}`,
    `  Avg Morning Freshness: ${colorScore(stats.avgMorningFreshness)}`,
    `  Avg Sunrise Resilience:${colorScore(stats.avgSunriseResilience)}`,
    `  Emerald Masterpieces:  ${stats.emeraldMasterpieceCount}`,
    `  Dawn Jewel:            ${stats.dawnJewelCount}`,
    `  Proper Gem:            ${stats.properGemCount}`,
    `  Cloudy Stone:          ${stats.cloudyStoneCount}`,
    `  Dull Rock:             ${stats.dullRockCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Radiance:      ${colorScore(stats.overallRadiance)}`,
    `  Lapidary Grade:        ${stats.lapidaryGrade}`,
    `  Best Ray:              ${stats.bestRay || 'N/A'}`,
    `  Most Vital:            ${stats.mostVital || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Freshest:              ${stats.freshest || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(46, 204, 113)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldSunriseResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Sunrise Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatGardensTable(result.gardens),
    '',
    chalk.bold('Morning Overview'),
    '',
    `  Avg Vitality:   ${colorScore(result.morning.avgVitality)}`,
    `  Avg Clarity:    ${colorScore(result.morning.avgClarity)}`,
    `  Avg Wisdom:     ${colorScore(result.morning.avgWisdom)}`,
    `  Radiance:       ${colorScore(result.morning.overallRadiance)}`,
    `  Is Emerald:     ${result.morning.isEmerald ? chalk.rgb(46, 204, 113)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldSunriseResult): string {
  return JSON.stringify(result, null, 2)
}
