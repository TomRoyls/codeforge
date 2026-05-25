import chalk from 'chalk'

import type { PetalCondition, GardenCondition, NightPetal, NightGarden, MidnightBlossomResult } from './midnight-blossom-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(120, 60, 200)(String(score))
  if (score >= 75) return chalk.rgb(140, 80, 190)(String(score))
  if (score >= 60) return chalk.rgb(160, 100, 180)(String(score))
  if (score >= 40) return chalk.rgb(130, 100, 140)(String(score))
  if (score >= 20) return chalk.rgb(110, 90, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('midnight-masterpiece') */
export function colorCondition(condition: PetalCondition | string): string {
  switch (condition) {
    case 'midnight-masterpiece':
      return chalk.rgb(120, 60, 200)('midnight-masterpiece')
    case 'rare-bloom':
      return chalk.rgb(140, 80, 190)('rare-bloom')
    case 'proper-flower':
      return chalk.rgb(160, 100, 180)('proper-flower')
    case 'wilting-petal':
      return chalk.rgb(130, 100, 140)('wilting-petal')
    case 'dead-leaf':
      return chalk.rgb(110, 90, 120)('dead-leaf')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGardenCondition('enchanted-garden') */
export function colorGardenCondition(condition: GardenCondition | string): string {
  switch (condition) {
    case 'enchanted-garden':
      return chalk.rgb(120, 60, 200)('enchanted-garden')
    case 'midnight-oasis':
      return chalk.rgb(140, 80, 190)('midnight-oasis')
    case 'proper-plot':
      return chalk.rgb(160, 100, 180)('proper-plot')
    case 'weed-patch':
      return chalk.rgb(130, 100, 140)('weed-patch')
    case 'desert':
      return chalk.rgb(110, 90, 120)('desert')
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

/** @example formatPetalTable(petal) */
export function formatPetalTable(petal: NightPetal): string {
  const lines: string[] = [
    chalk.bold(`Night Petal: ${petal.file}`),
    '',
    `  Nocturnal Bloom:   ${colorScore(petal.nocturnalBloom)}  ${chalk.dim(`(${petal.unfolding.petal})`)}`,
    `  Shadow Depth:      ${colorScore(petal.shadowDepth)}  ${chalk.dim(`(${petal.deepening.shadow})`)}`,
    `  Moonlit Clarity:   ${colorScore(petal.moonlitClarity)}  ${chalk.dim(`(${petal.gleaming.moon})`)}`,
    `  Night Fragrance:   ${colorScore(petal.nightFragrance)}  ${chalk.dim(`(${petal.diffusing.scent})`)}`,
    `  Dark Resilience:   ${colorScore(petal.darkResilience)}  ${chalk.dim(`(${petal.persisting.night})`)}`,
    '',
    `  Quality Score: ${colorScore(petal.qualityScore)}  ${chalk.dim(`(${colorCondition(petal.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPetalsTable(petals) */
export function formatPetalsTable(petals: NightPetal[]): string {
  if (petals.length === 0) return chalk.dim('No night petals found')

  const colWidths = {
    file: Math.max(4, ...petals.map((p) => p.file.length)),
    bloom: Math.max(4, ...petals.map((p) => String(p.nocturnalBloom).length)),
    depth: Math.max(4, ...petals.map((p) => String(p.shadowDepth).length)),
    clar: Math.max(4, ...petals.map((p) => String(p.moonlitClarity).length)),
    frag: Math.max(4, ...petals.map((p) => String(p.nightFragrance).length)),
    res: Math.max(4, ...petals.map((p) => String(p.darkResilience).length)),
    score: Math.max(5, ...petals.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Night Petals'), '']

  const header =
    chalk.rgb(120, 60, 200)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Bloom', colWidths.bloom)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Depth', colWidths.depth)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Frag', colWidths.frag)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Resi', colWidths.res)) +
    '  ' +
    chalk.rgb(120, 60, 200)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of petals) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.nocturnalBloom), colWidths.bloom) +
        '  ' +
        padLeft(String(p.shadowDepth), colWidths.depth) +
        '  ' +
        padLeft(String(p.moonlitClarity), colWidths.clar) +
        '  ' +
        padLeft(String(p.nightFragrance), colWidths.frag) +
        '  ' +
        padLeft(String(p.darkResilience), colWidths.res) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatGardenTable(garden) */
export function formatGardenTable(garden: NightGarden): string {
  const lines: string[] = [
    chalk.bold(`Night Garden: ${garden.directory}`),
    '',
    `  Petals:               ${garden.petals.length}`,
    `  Avg Bloom:            ${colorScore(garden.avgBloom)}`,
    `  Avg Depth:            ${colorScore(garden.avgDepth)}`,
    `  Avg Wisdom:           ${colorScore(garden.avgWisdom)}`,
    `  Masterpieces:         ${garden.midnightMasterpieceCount}`,
    `  Garden Type:          ${garden.gardenType}`,
    `  Condition:            ${colorGardenCondition(garden.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGardensTable(gardens) */
export function formatGardensTable(gardens: NightGarden[]): string {
  if (gardens.length === 0) return chalk.dim('No night gardens found')

  const lines: string[] = [chalk.bold('Night Gardens'), '']

  for (const g of gardens) {
    lines.push(
      `  ${chalk.rgb(120, 60, 200)(g.directory)}  ${colorScore(g.avgBloom)}  ${colorGardenCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: MidnightBlossomResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Midnight Blossom Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Gardens:         ${stats.totalGardens}`,
    `  Avg Nocturnal Bloom:   ${colorScore(stats.avgNocturnalBloom)}`,
    `  Avg Shadow Depth:      ${colorScore(stats.avgShadowDepth)}`,
    `  Avg Moonlit Clarity:   ${colorScore(stats.avgMoonlitClarity)}`,
    `  Avg Night Fragrance:   ${colorScore(stats.avgNightFragrance)}`,
    `  Avg Dark Resilience:   ${colorScore(stats.avgDarkResilience)}`,
    `  Midnight Masterpieces: ${stats.midnightMasterpieceCount}`,
    `  Rare Bloom:            ${stats.rareBloomCount}`,
    `  Proper Flower:         ${stats.properFlowerCount}`,
    `  Wilting Petal:         ${stats.wiltingPetalCount}`,
    `  Dead Leaf:             ${stats.deadLeafCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Luminosity:    ${colorScore(stats.overallLuminosity)}`,
    `  Gardener Grade:        ${stats.gardenerGrade}`,
    `  Best Petal:            ${stats.bestPetal || 'N/A'}`,
    `  Best Bloom:            ${stats.bestBloom || 'N/A'}`,
    `  Deepest:               ${stats.deepest || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Fragrant:         ${stats.mostFragrant || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(120, 60, 200)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: MidnightBlossomResult): string {
  const lines: string[] = [
    chalk.bold('Midnight Blossom Analysis'),
    '',
    formatPetalsTable(result.petals),
    '',
    formatGardensTable(result.gardens),
    '',
    chalk.bold('Night Overview'),
    '',
    `  Avg Bloom:      ${colorScore(result.night.avgBloom)}`,
    `  Avg Depth:      ${colorScore(result.night.avgDepth)}`,
    `  Avg Wisdom:     ${colorScore(result.night.avgWisdom)}`,
    `  Luminosity:     ${colorScore(result.night.overallLuminosity)}`,
    `  Is Nocturnal:   ${result.night.isNocturnal ? chalk.rgb(120, 60, 200)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: MidnightBlossomResult): string {
  return JSON.stringify(result, null, 2)
}
