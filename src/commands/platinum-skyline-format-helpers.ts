import chalk from 'chalk'

import type { IngotCondition, PlatinumIngot, PlatinumRidge, PlatinumSkylineResult, RidgeCondition } from './platinum-skyline-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 200, 220)(String(score))
  if (score >= 75) return chalk.rgb(180, 180, 200)(String(score))
  if (score >= 60) return chalk.rgb(160, 160, 180)(String(score))
  if (score >= 40) return chalk.rgb(140, 140, 160)(String(score))
  if (score >= 20) return chalk.rgb(120, 120, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorIngotCondition('platinum-masterpiece') */
export function colorIngotCondition(condition: IngotCondition | string): string {
  switch (condition) {
    case 'platinum-masterpiece':
      return chalk.rgb(200, 200, 220)('platinum-masterpiece')
    case 'royal-standard':
      return chalk.rgb(180, 180, 200)('royal-standard')
    case 'proper-metal':
      return chalk.rgb(160, 160, 180)('proper-metal')
    case 'base-alloy':
      return chalk.rgb(140, 140, 160)('base-alloy')
    case 'scrap-metal':
      return chalk.rgb(120, 120, 140)('scrap-metal')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorRidgeCondition('platinum-summit') */
export function colorRidgeCondition(condition: RidgeCondition | string): string {
  switch (condition) {
    case 'platinum-summit':
      return chalk.rgb(200, 200, 220)('platinum-summit')
    case 'golden-peak':
      return chalk.rgb(180, 180, 200)('golden-peak')
    case 'proper-mountain':
      return chalk.rgb(160, 160, 180)('proper-mountain')
    case 'rocky-hill':
      return chalk.rgb(140, 140, 160)('rocky-hill')
    case 'sand-dune':
      return chalk.rgb(120, 120, 140)('sand-dune')
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

/** @example formatIngotTable(ingot) */
export function formatIngotTable(ingot: PlatinumIngot): string {
  const lines: string[] = [
    chalk.bold(`Platinum Ingot: ${ingot.file}`),
    '',
    `  Royal Purity:        ${colorScore(ingot.royalPurity)}  ${chalk.dim(`(${ingot.purifying.grade})`)}`,
    `  Horizon Vision:      ${colorScore(ingot.horizonVision)}  ${chalk.dim(`(${ingot.envisioning.horizon})`)}`,
    `  Platinum Resilience: ${colorScore(ingot.platinumResilience)}  ${chalk.dim(`(${ingot.enduring.temper})`)}`,
    `  Crest Authority:     ${colorScore(ingot.crestAuthority)}  ${chalk.dim(`(${ingot.commanding.crest})`)}`,
    `  Future Wisdom:       ${colorScore(ingot.futureWisdom)}  ${chalk.dim(`(${ingot.anticipating.foresight})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${colorIngotCondition(ingot.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: PlatinumIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No platinum ingots found')

  const colWidths = {
    file: Math.max(4, ...ingots.map((i) => i.file.length)),
    pur: Math.max(4, ...ingots.map((i) => String(i.royalPurity).length)),
    vis: Math.max(4, ...ingots.map((i) => String(i.horizonVision).length)),
    res: Math.max(4, ...ingots.map((i) => String(i.platinumResilience).length)),
    auth: Math.max(4, ...ingots.map((i) => String(i.crestAuthority).length)),
    wis: Math.max(4, ...ingots.map((i) => String(i.futureWisdom).length)),
    score: Math.max(5, ...ingots.map((i) => String(i.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Platinum Ingots'), '']

  const header =
    chalk.rgb(200, 200, 220)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Pur', colWidths.pur)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Vis', colWidths.vis)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Auth', colWidths.auth)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const i of ingots) {
    lines.push(
      padRight(i.file, colWidths.file) +
        '  ' +
        padLeft(String(i.royalPurity), colWidths.pur) +
        '  ' +
        padLeft(String(i.horizonVision), colWidths.vis) +
        '  ' +
        padLeft(String(i.platinumResilience), colWidths.res) +
        '  ' +
        padLeft(String(i.crestAuthority), colWidths.auth) +
        '  ' +
        padLeft(String(i.futureWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(i.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatRidgeTable(ridge) */
export function formatRidgeTable(ridge: PlatinumRidge): string {
  const lines: string[] = [
    chalk.bold(`Platinum Ridge: ${ridge.directory}`),
    '',
    `  Ingots:           ${ridge.ingots.length}`,
    `  Avg Purity:       ${colorScore(ridge.avgPurity)}`,
    `  Avg Vision:       ${colorScore(ridge.avgVision)}`,
    `  Avg Wisdom:       ${colorScore(ridge.avgWisdom)}`,
    `  Masterpieces:     ${ridge.platinumMasterpieceCount}`,
    `  Ridge Type:       ${ridge.ridgeType}`,
    `  Condition:        ${colorRidgeCondition(ridge.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatRidgesTable(ridges) */
export function formatRidgesTable(ridges: PlatinumRidge[]): string {
  if (ridges.length === 0) return chalk.dim('No platinum ridges found')

  const lines: string[] = [chalk.bold('Platinum Ridges'), '']

  for (const r of ridges) {
    lines.push(
      `  ${chalk.rgb(200, 200, 220)(r.directory)}  ${colorScore(r.avgPurity)}  ${colorRidgeCondition(r.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PlatinumSkylineResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Platinum Skyline Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Ridges:            ${stats.totalRidges}`,
    `  Avg Royal Purity:        ${colorScore(stats.avgRoyalPurity)}`,
    `  Avg Horizon Vision:      ${colorScore(stats.avgHorizonVision)}`,
    `  Avg Platinum Resilience: ${colorScore(stats.avgPlatinumResilience)}`,
    `  Avg Crest Authority:     ${colorScore(stats.avgCrestAuthority)}`,
    `  Avg Future Wisdom:       ${colorScore(stats.avgFutureWisdom)}`,
    `  Platinum Masterpieces:   ${stats.platinumMasterpieceCount}`,
    `  Royal Standard:          ${stats.royalStandardCount}`,
    `  Proper Metal:            ${stats.properMetalCount}`,
    `  Base Alloy:              ${stats.baseAlloyCount}`,
    `  Scrap Metal:             ${stats.scrapMetalCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Elevation:       ${colorScore(stats.overallElevation)}`,
    `  Alchemist Grade:         ${stats.alchemistGrade}`,
    `  Best Ingot:              ${stats.bestIngot || 'N/A'}`,
    `  Purest:                  ${stats.purest || 'N/A'}`,
    `  Most Visionary:          ${stats.mostVisionary || 'N/A'}`,
    `  Most Resilient:          ${stats.mostResilient || 'N/A'}`,
    `  Most Authoritative:      ${stats.mostAuthoritative || 'N/A'}`,
    `  Wisest:                  ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(200, 200, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PlatinumSkylineResult): string {
  const lines: string[] = [
    chalk.bold('Platinum Skyline Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatRidgesTable(result.ridges),
    '',
    chalk.bold('Vista Overview'),
    '',
    `  Avg Purity:    ${colorScore(result.vista.avgPurity)}`,
    `  Avg Vision:    ${colorScore(result.vista.avgVision)}`,
    `  Avg Wisdom:    ${colorScore(result.vista.avgWisdom)}`,
    `  Elevation:     ${colorScore(result.vista.overallElevation)}`,
    `  Is Platinum:   ${result.vista.isPlatinum ? chalk.rgb(200, 200, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PlatinumSkylineResult): string {
  return JSON.stringify(result, null, 2)
}
