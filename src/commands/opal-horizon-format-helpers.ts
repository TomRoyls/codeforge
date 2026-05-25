import chalk from 'chalk'

import type { DepositCondition, FireCondition, OpalFire, OpalDeposit, OpalHorizonStats, OpalHorizonResult } from './opal-horizon-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 165, 0)(String(score))
  if (score >= 75) return chalk.rgb(255, 140, 0)(String(score))
  if (score >= 60) return chalk.rgb(255, 200, 80)(String(score))
  if (score >= 40) return chalk.rgb(200, 150, 50)(String(score))
  if (score >= 20) return chalk.rgb(150, 100, 50)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('opal-masterpiece') */
export function colorCondition(condition: FireCondition | string): string {
  switch (condition) {
    case 'opal-masterpiece':
      return chalk.rgb(255, 165, 0)('opal-masterpiece')
    case 'fire-horizon':
      return chalk.rgb(255, 140, 0)('fire-horizon')
    case 'proper-gem':
      return chalk.rgb(255, 200, 80)('proper-gem')
    case 'dull-stone':
      return chalk.rgb(200, 150, 50)('dull-stone')
    case 'common-rock':
      return chalk.rgb(150, 100, 50)('common-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorDepositCondition('opal-paradise') */
export function colorDepositCondition(condition: DepositCondition | string): string {
  switch (condition) {
    case 'opal-paradise':
      return chalk.rgb(255, 165, 0)('opal-paradise')
    case 'fire-desert':
      return chalk.rgb(255, 140, 0)('fire-desert')
    case 'proper-field':
      return chalk.rgb(255, 200, 80)('proper-field')
    case 'dull-ground':
      return chalk.rgb(200, 150, 50)('dull-ground')
    case 'barren-earth':
      return chalk.rgb(150, 100, 50)('barren-earth')
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

/** @example formatFireTable(fire) */
export function formatFireTable(fire: OpalFire): string {
  const lines: string[] = [
    chalk.bold(`Opal Fire: ${fire.file}`),
    '',
    `  Play of Color:       ${colorScore(fire.playOfColor)}  ${chalk.dim(`(${fire.shifting.spectrum})`)}`,
    `  Dawn Clarity:        ${colorScore(fire.dawnClarity)}  ${chalk.dim(`(${fire.illuminating.dawn})`)}`,
    `  Fire Warmth:         ${colorScore(fire.fireWarmth)}  ${chalk.dim(`(${fire.blazing.fire})`)}`,
    `  Spectrum Richness:   ${colorScore(fire.spectrumRichness)}  ${chalk.dim(`(${fire.spanning.spectrum})`)}`,
    `  Opalescence Quality: ${colorScore(fire.opalescenceQuality)}  ${chalk.dim(`(${fire.glowing.opal})`)}`,
    '',
    `  Quality Score: ${colorScore(fire.qualityScore)}  ${chalk.dim(`(${colorCondition(fire.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFiresTable(fires) */
export function formatFiresTable(fires: OpalFire[]): string {
  if (fires.length === 0) return chalk.dim('No opal fires found')

  const colWidths = {
    file: Math.max(4, ...fires.map((f) => f.file.length)),
    color: Math.max(5, ...fires.map((f) => String(f.playOfColor).length)),
    clarity: Math.max(7, ...fires.map((f) => String(f.dawnClarity).length)),
    warmth: Math.max(6, ...fires.map((f) => String(f.fireWarmth).length)),
    richness: Math.max(8, ...fires.map((f) => String(f.spectrumRichness).length)),
    quality: Math.max(7, ...fires.map((f) => String(f.opalescenceQuality).length)),
    score: Math.max(5, ...fires.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Opal Fires'), '']

  const header =
    chalk.rgb(255, 165, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Color', colWidths.color)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Warmth', colWidths.warmth)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Richness', colWidths.richness)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Quality', colWidths.quality)) +
    '  ' +
    chalk.rgb(255, 165, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of fires) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.playOfColor), colWidths.color) +
        '  ' +
        padLeft(String(f.dawnClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(f.fireWarmth), colWidths.warmth) +
        '  ' +
        padLeft(String(f.spectrumRichness), colWidths.richness) +
        '  ' +
        padLeft(String(f.opalescenceQuality), colWidths.quality) +
        '  ' +
        padLeft(String(f.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatDepositTable(deposit) */
export function formatDepositTable(deposit: OpalDeposit): string {
  const lines: string[] = [
    chalk.bold(`Opal Deposit: ${deposit.directory}`),
    '',
    `  Fires:            ${deposit.fires.length}`,
    `  Avg Clarity:      ${colorScore(deposit.avgClarity)}`,
    `  Avg Richness:     ${colorScore(deposit.avgRichness)}`,
    `  Avg Quality:      ${colorScore(deposit.avgQuality)}`,
    `  Masterpieces:     ${deposit.opalMasterpieceCount}`,
    `  Deposit Type:     ${deposit.depositType}`,
    `  Condition:        ${colorDepositCondition(deposit.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatDepositsTable(deposits) */
export function formatDepositsTable(deposits: OpalDeposit[]): string {
  if (deposits.length === 0) return chalk.dim('No opal deposits found')

  const lines: string[] = [chalk.bold('Opal Deposits'), '']

  for (const d of deposits) {
    lines.push(
      `  ${chalk.rgb(255, 165, 0)(d.directory)}  ${colorScore(d.avgQuality)}  ${colorDepositCondition(d.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OpalHorizonStats): string {
  const lines: string[] = [
    chalk.bold('Opal Horizon Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Deposits:        ${stats.totalDeposits}`,
    `  Avg Play of Color:     ${colorScore(stats.avgPlayOfColor)}`,
    `  Avg Dawn Clarity:      ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Fire Warmth:       ${colorScore(stats.avgFireWarmth)}`,
    `  Avg Spectrum Richness: ${colorScore(stats.avgSpectrumRichness)}`,
    `  Avg Opalescence:       ${colorScore(stats.avgOpalescenceQuality)}`,
    `  Opal Masterpieces:     ${stats.opalMasterpieceCount}`,
    `  Fire Horizon:          ${stats.fireHorizonCount}`,
    `  Proper Gem:            ${stats.properGemCount}`,
    `  Dull Stone:            ${stats.dullStoneCount}`,
    `  Common Rock:           ${stats.commonRockCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Gemologist Grade:      ${stats.gemologistGrade}`,
    `  Best Fire:             ${stats.bestFire || 'N/A'}`,
    `  Most Colorful:         ${stats.mostColorful || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Warmest:               ${stats.warmest || 'N/A'}`,
    `  Most Diverse:          ${stats.mostDiverse || 'N/A'}`,
    `  Most Glowing:          ${stats.mostGlowing || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 165, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OpalHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Opal Horizon Analysis'),
    '',
    formatFiresTable(result.fires),
    '',
    formatDepositsTable(result.deposits),
    '',
    chalk.bold('Sky Overview'),
    '',
    `  Avg Clarity:        ${colorScore(result.sky.avgClarity)}`,
    `  Avg Richness:       ${colorScore(result.sky.avgRichness)}`,
    `  Avg Quality:        ${colorScore(result.sky.avgQuality)}`,
    `  Overall Brilliance: ${colorScore(result.sky.overallBrilliance)}`,
    `  Is Opal:            ${result.sky.isOpal ? chalk.rgb(255, 165, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OpalHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
