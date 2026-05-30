import chalk from 'chalk'

import type { FlowerCondition, GardenCondition, Moonflower, MoonGarden, MidnightBloomStats, MidnightBloomResult } from './midnight-bloom-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(138, 43, 226)(String(score))
  if (score >= 75) return chalk.rgb(128, 0, 128)(String(score))
  if (score >= 60) return chalk.rgb(147, 112, 219)(String(score))
  if (score >= 40) return chalk.rgb(100, 80, 160)(String(score))
  if (score >= 20) return chalk.rgb(80, 60, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('midnight-masterpiece') */
export function colorCondition(condition: FlowerCondition | string): string {
  switch (condition) {
    case 'midnight-masterpiece':
      return chalk.rgb(138, 43, 226)('midnight-masterpiece')
    case 'moonlit-paradise':
      return chalk.rgb(128, 0, 128)('moonlit-paradise')
    case 'proper-garden':
      return chalk.rgb(147, 112, 219)('proper-garden')
    case 'dim-plot':
      return chalk.rgb(100, 80, 160)('dim-plot')
    case 'barren-earth':
      return chalk.rgb(80, 60, 140)('barren-earth')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGardenCondition('nocturnal-paradise') */
export function colorGardenCondition(condition: GardenCondition | string): string {
  switch (condition) {
    case 'nocturnal-paradise':
      return chalk.rgb(138, 43, 226)('nocturnal-paradise')
    case 'moonlit-garden':
      return chalk.rgb(128, 0, 128)('moonlit-garden')
    case 'proper-plot':
      return chalk.rgb(147, 112, 219)('proper-plot')
    case 'dim-corner':
      return chalk.rgb(100, 80, 160)('dim-corner')
    case 'barren-earth':
      return chalk.rgb(80, 60, 140)('barren-earth')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFlowerTable(flower) */
export function formatFlowerTable(flower: Moonflower): string {
  const lines: string[] = [
    chalk.bold(`Moonflower: ${flower.file}`),
    '',
    `  Nocturnal Bloom:   ${colorScore(flower.nocturnalBloom)}  ${chalk.dim(`(${flower.blossoming.petal})`)}`,
    `  Shadow Depth:      ${colorScore(flower.shadowDepth)}  ${chalk.dim(`(${flower.deepening.shadow})`)}`,
    `  Moonlit Clarity:   ${colorScore(flower.moonlitClarity)}  ${chalk.dim(`(${flower.revealing.moon})`)}`,
    `  Night Fragrance:   ${colorScore(flower.nightFragrance)}  ${chalk.dim(`(${flower.scenting.scent})`)}`,
    `  Dark Resilience:   ${colorScore(flower.darkResilience)}  ${chalk.dim(`(${flower.enduring.night})`)}`,
    '',
    `  Quality Score: ${colorScore(flower.qualityScore)}  ${chalk.dim(`(${colorCondition(flower.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFlowersTable(flowers) */
export function formatFlowersTable(flowers: Moonflower[]): string {
  if (flowers.length === 0) return chalk.dim('No moonflowers found')

  const colWidths = {
    file: Math.max(4, ...flowers.map((f) => f.file.length)),
    bloom: Math.max(4, ...flowers.map((f) => String(f.nocturnalBloom).length)),
    depth: Math.max(4, ...flowers.map((f) => String(f.shadowDepth).length)),
    clar: Math.max(5, ...flowers.map((f) => String(f.moonlitClarity).length)),
    frag: Math.max(4, ...flowers.map((f) => String(f.nightFragrance).length)),
    res: Math.max(4, ...flowers.map((f) => String(f.darkResilience).length)),
    score: Math.max(5, ...flowers.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Moonflowers'), '']

  const header =
    chalk.rgb(138, 43, 226)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Bloom', colWidths.bloom)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Depth', colWidths.depth)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Frag', colWidths.frag)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(138, 43, 226)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of flowers) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.nocturnalBloom), colWidths.bloom) +
        '  ' +
        padLeft(String(f.shadowDepth), colWidths.depth) +
        '  ' +
        padLeft(String(f.moonlitClarity), colWidths.clar) +
        '  ' +
        padLeft(String(f.nightFragrance), colWidths.frag) +
        '  ' +
        padLeft(String(f.darkResilience), colWidths.res) +
        '  ' +
        padLeft(String(f.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatGardenTable(garden) */
export function formatGardenTable(garden: MoonGarden): string {
  const lines: string[] = [
    chalk.bold(`Moon Garden: ${garden.directory}`),
    '',
    `  Flowers:                ${garden.flowers.length}`,
    `  Avg Bloom:              ${colorScore(garden.avgBloom)}`,
    `  Avg Depth:              ${colorScore(garden.avgDepth)}`,
    `  Avg Resilience:         ${colorScore(garden.avgResilience)}`,
    `  Midnight Masterpieces:  ${garden.midnightMasterpieceCount}`,
    `  Garden Type:            ${garden.gardenType}`,
    `  Condition:              ${colorGardenCondition(garden.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGardensTable(gardens) */
export function formatGardensTable(gardens: MoonGarden[]): string {
  if (gardens.length === 0) return chalk.dim('No moon gardens found')

  const lines: string[] = [chalk.bold('Moon Gardens'), '']

  for (const g of gardens) {
    lines.push(
      `  ${chalk.rgb(138, 43, 226)(g.directory)}  ${colorScore(g.avgBloom)}  ${colorGardenCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: MidnightBloomStats): string {
  const lines: string[] = [
    chalk.bold('Midnight Bloom Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Gardens:          ${stats.totalGardens}`,
    `  Avg Nocturnal Bloom:    ${colorScore(stats.avgNocturnalBloom)}`,
    `  Avg Shadow Depth:       ${colorScore(stats.avgShadowDepth)}`,
    `  Avg Moonlit Clarity:    ${colorScore(stats.avgMoonlitClarity)}`,
    `  Avg Night Fragrance:    ${colorScore(stats.avgNightFragrance)}`,
    `  Avg Dark Resilience:    ${colorScore(stats.avgDarkResilience)}`,
    `  Midnight Masterpieces:  ${stats.midnightMasterpieceCount}`,
    `  Moonlit Paradises:      ${stats.moonlitParadiseCount}`,
    `  Proper Gardens:         ${stats.properGardenCount}`,
    `  Dim Plots:              ${stats.dimPlotCount}`,
    `  Barren Earth:           ${stats.barrenEarthCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Luminosity:     ${colorScore(stats.overallLuminosity)}`,
    `  Gardener Grade:         ${stats.gardenerGrade}`,
    `  Best Flower:            ${stats.bestFlower || 'N/A'}`,
    `  Most Blooming:          ${stats.mostBlooming || 'N/A'}`,
    `  Deepest:                ${stats.deepest || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Fragrant:          ${stats.mostFragrant || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(138, 43, 226)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: MidnightBloomResult): string {
  const lines: string[] = [
    chalk.bold('Midnight Bloom Analysis'),
    '',
    formatFlowersTable(result.flowers),
    '',
    formatGardensTable(result.gardens),
    '',
    chalk.bold('Night Overview'),
    '',
    `  Avg Bloom:         ${colorScore(result.night.avgBloom)}`,
    `  Avg Depth:         ${colorScore(result.night.avgDepth)}`,
    `  Avg Resilience:    ${colorScore(result.night.avgResilience)}`,
    `  Overall Luminosity:${colorScore(result.night.overallLuminosity)}`,
    `  Is Midnight:       ${result.night.isMidnight ? chalk.rgb(138, 43, 226)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: MidnightBloomResult): string {
  return JSON.stringify(result, null, 2)
}
