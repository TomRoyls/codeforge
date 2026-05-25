import chalk from 'chalk'

import type { GardenCondition, RayCondition, EmeraldRay, EmeraldGarden, EmeraldDawnStats, EmeraldDawnResult } from './emerald-dawn-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.green(String(score))
  if (score >= 75) return chalk.rgb(0, 180, 0)(String(score))
  if (score >= 60) return chalk.rgb(144, 238, 144)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('emerald-masterpiece') */
export function colorCondition(condition: RayCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece':
      return chalk.green('emerald-masterpiece')
    case 'green-paradise':
      return chalk.rgb(0, 180, 0)('green-paradise')
    case 'proper-garden':
      return chalk.rgb(144, 238, 144)('proper-garden')
    case 'wilting-bed':
      return chalk.yellow('wilting-bed')
    case 'barren-soil':
      return chalk.rgb(255, 165, 0)('barren-soil')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGardenCondition('paradise-garden') */
export function colorGardenCondition(condition: GardenCondition | string): string {
  switch (condition) {
    case 'paradise-garden':
      return chalk.green('paradise-garden')
    case 'emerald-haven':
      return chalk.rgb(0, 180, 0)('emerald-haven')
    case 'proper-plot':
      return chalk.rgb(144, 238, 144)('proper-plot')
    case 'wilting-bed':
      return chalk.yellow('wilting-bed')
    case 'barren-soil':
      return chalk.rgb(255, 165, 0)('barren-soil')
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

/** @example formatRayTable(ray) */
export function formatRayTable(ray: EmeraldRay): string {
  const lines: string[] = [
    chalk.bold(`Emerald Ray: ${ray.file}`),
    '',
    `  Green Vitality:      ${colorScore(ray.greenVitality)}  ${chalk.dim(`(${ray.growing.garden})`)}`,
    `  Dawn Clarity:        ${colorScore(ray.dawnClarity)}  ${chalk.dim(`(${ray.illuminating.light})`)}`,
    `  Gem Wisdom:          ${colorScore(ray.gemWisdom)}  ${chalk.dim(`(${ray.knowing.emerald})`)}`,
    `  Morning Freshness:   ${colorScore(ray.morningFreshness)}  ${chalk.dim(`(${ray.refreshing.dew})`)}`,
    `  Sunrise Resilience:  ${colorScore(ray.sunriseResilience)}  ${chalk.dim(`(${ray.rising.dawn})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${colorCondition(ray.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: EmeraldRay[]): string {
  if (rays.length === 0) return chalk.dim('No emerald rays found')

  const colWidths = {
    file: Math.max(4, ...rays.map((r) => r.file.length)),
    vitality: Math.max(8, ...rays.map((r) => String(r.greenVitality).length)),
    clarity: Math.max(7, ...rays.map((r) => String(r.dawnClarity).length)),
    wisdom: Math.max(6, ...rays.map((r) => String(r.gemWisdom).length)),
    freshness: Math.max(9, ...rays.map((r) => String(r.morningFreshness).length)),
    resilience: Math.max(10, ...rays.map((r) => String(r.sunriseResilience).length)),
    score: Math.max(5, ...rays.map((r) => String(r.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Emerald Rays'), '']

  const header =
    chalk.green(padRight('File', colWidths.file)) +
    '  ' +
    chalk.green(padLeft('Vitality', colWidths.vitality)) +
    '  ' +
    chalk.green(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.green(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.green(padLeft('Freshness', colWidths.freshness)) +
    '  ' +
    chalk.green(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.green(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const r of rays) {
    lines.push(
      padRight(r.file, colWidths.file) +
        '  ' +
        padLeft(String(r.greenVitality), colWidths.vitality) +
        '  ' +
        padLeft(String(r.dawnClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(r.gemWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(r.morningFreshness), colWidths.freshness) +
        '  ' +
        padLeft(String(r.sunriseResilience), colWidths.resilience) +
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
    `  Rays:             ${garden.rays.length}`,
    `  Avg Vitality:     ${colorScore(garden.avgVitality)}`,
    `  Avg Clarity:      ${colorScore(garden.avgClarity)}`,
    `  Avg Wisdom:       ${colorScore(garden.avgWisdom)}`,
    `  Masterpieces:     ${garden.emeraldMasterpieceCount}`,
    `  Garden Type:      ${garden.gardenType}`,
    `  Condition:        ${colorGardenCondition(garden.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGardensTable(gardens) */
export function formatGardensTable(gardens: EmeraldGarden[]): string {
  if (gardens.length === 0) return chalk.dim('No emerald gardens found')

  const lines: string[] = [chalk.bold('Emerald Gardens'), '']

  for (const g of gardens) {
    lines.push(
      `  ${chalk.green(g.directory)}  ${colorScore(g.avgVitality)}  ${colorGardenCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldDawnStats): string {
  const lines: string[] = [
    chalk.bold('Emerald Dawn Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Gardens:          ${stats.totalGardens}`,
    `  Avg Green Vitality:     ${colorScore(stats.avgGreenVitality)}`,
    `  Avg Dawn Clarity:       ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Gem Wisdom:         ${colorScore(stats.avgGemWisdom)}`,
    `  Avg Morning Freshness:  ${colorScore(stats.avgMorningFreshness)}`,
    `  Avg Sunrise Resilience: ${colorScore(stats.avgSunriseResilience)}`,
    `  Emerald Masterpieces:   ${stats.emeraldMasterpieceCount}`,
    `  Green Paradises:        ${stats.greenParadiseCount}`,
    `  Proper Gardens:         ${stats.properGardenCount}`,
    `  Wilting Beds:           ${stats.wiltingBedCount}`,
    `  Barren Soil:            ${stats.barrenSoilCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Brilliance:     ${colorScore(stats.overallBrilliance)}`,
    `  Gardener Grade:         ${stats.gardenerGrade}`,
    `  Best Ray:               ${stats.bestRay || 'N/A'}`,
    `  Most Vital:             ${stats.mostVital || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
    `  Freshest:               ${stats.freshest || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.green('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldDawnResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Dawn Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatGardensTable(result.gardens),
    '',
    chalk.bold('Sunrise Overview'),
    '',
    `  Avg Vitality:      ${colorScore(result.sunrise.avgVitality)}`,
    `  Avg Clarity:       ${colorScore(result.sunrise.avgClarity)}`,
    `  Avg Wisdom:        ${colorScore(result.sunrise.avgWisdom)}`,
    `  Overall Brilliance: ${colorScore(result.sunrise.overallBrilliance)}`,
    `  Is Emerald:        ${result.sunrise.isEmerald ? chalk.green('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldDawnResult): string {
  return JSON.stringify(result, null, 2)
}
