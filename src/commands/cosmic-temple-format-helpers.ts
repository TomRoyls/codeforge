import chalk from 'chalk'

import type { PillarCondition, NaveCondition, StellarPillar, StellarCathedralResult, StellarNave } from './cosmic-temple-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 215, 0)(String(score))
  if (score >= 75) return chalk.rgb(180, 130, 255)(String(score))
  if (score >= 60) return chalk.rgb(100, 149, 237)(String(score))
  if (score >= 40) return chalk.rgb(75, 0, 130)(String(score))
  if (score >= 20) return chalk.rgb(50, 50, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPillarCondition('stellar-masterpiece') */
export function colorPillarCondition(condition: PillarCondition | string): string {
  switch (condition) {
    case 'stellar-masterpiece':
      return chalk.rgb(255, 215, 0)('stellar-masterpiece')
    case 'cosmic-perfection':
      return chalk.rgb(180, 130, 255)('cosmic-perfection')
    case 'proper-star-temple':
      return chalk.rgb(100, 149, 237)('proper-star-temple')
    case 'mortal-chapel':
      return chalk.rgb(75, 0, 130)('mortal-chapel')
    case 'ruined-shrine':
      return chalk.rgb(50, 50, 120)('ruined-shrine')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorNaveCondition('universal-cathedral') */
export function colorNaveCondition(condition: NaveCondition | string): string {
  switch (condition) {
    case 'universal-cathedral':
      return chalk.rgb(255, 215, 0)('universal-cathedral')
    case 'galactic-sanctuary':
      return chalk.rgb(180, 130, 255)('galactic-sanctuary')
    case 'proper-church':
      return chalk.rgb(100, 149, 237)('proper-church')
    case 'ruined-abbey':
      return chalk.rgb(75, 0, 130)('ruined-abbey')
    case 'empty-space':
      return chalk.rgb(50, 50, 120)('empty-space')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPillarTable(pillar) */
export function formatPillarTable(pillar: StellarPillar): string {
  const lines: string[] = [
    chalk.bold(`Stellar Pillar: ${pillar.file}`),
    '',
    `  Cosmic Architecture:     ${colorScore(pillar.cosmicArchitecture)}  ${chalk.dim(`(${pillar.designing.blueprint})`)}`,
    `  Star Sanctity:           ${colorScore(pillar.starSanctity)}  ${chalk.dim(`(${pillar.sanctifying.star})`)}`,
    `  Vault Clarity:           ${colorScore(pillar.vaultClarity)}  ${chalk.dim(`(${pillar.revealing.vault})`)}`,
    `  Celestial Precision:     ${colorScore(pillar.celestialPrecision)}  ${chalk.dim(`(${pillar.calibrating.calibration})`)}`,
    `  Dawn Transcendence:      ${colorScore(pillar.dawnTranscendence)}  ${chalk.dim(`(${pillar.transcending.dawn})`)}`,
    '',
    `  Quality Score: ${colorScore(pillar.qualityScore)}  ${chalk.dim(`(${colorPillarCondition(pillar.condition)})`)}`,
  ]
  if (pillar.celebration) {
    lines.push('')
    lines.push(chalk.rgb(255, 215, 0)(pillar.celebration))
  }
  return lines.join('\n')
}

/** @example formatPillarsTable(pillars) */
export function formatPillarsTable(pillars: StellarPillar[]): string {
  if (pillars.length === 0) return chalk.dim('No stellar pillars found')

  const colWidths = {
    file: Math.max(4, ...pillars.map((p) => p.file.length)),
    arch: Math.max(4, ...pillars.map((p) => String(p.cosmicArchitecture).length)),
    sanc: Math.max(4, ...pillars.map((p) => String(p.starSanctity).length)),
    clar: Math.max(4, ...pillars.map((p) => String(p.vaultClarity).length)),
    prec: Math.max(4, ...pillars.map((p) => String(p.celestialPrecision).length)),
    tran: Math.max(4, ...pillars.map((p) => String(p.dawnTranscendence).length)),
    score: Math.max(5, ...pillars.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Stellar Pillars'), '']

  const header =
    chalk.rgb(255, 215, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Arch', colWidths.arch)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Sanc', colWidths.sanc)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Tran', colWidths.tran)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of pillars) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.cosmicArchitecture), colWidths.arch) +
        '  ' +
        padLeft(String(p.starSanctity), colWidths.sanc) +
        '  ' +
        padLeft(String(p.vaultClarity), colWidths.clar) +
        '  ' +
        padLeft(String(p.celestialPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(p.dawnTranscendence), colWidths.tran) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatNaveTable(nave) */
export function formatNaveTable(nave: StellarNave): string {
  const lines: string[] = [
    chalk.bold(`Stellar Nave: ${nave.directory}`),
    '',
    `  Pillars:              ${nave.pillars.length}`,
    `  Avg Architecture:    ${colorScore(nave.avgArchitecture)}`,
    `  Avg Precision:       ${colorScore(nave.avgPrecision)}`,
    `  Avg Transcendence:   ${colorScore(nave.avgTranscendence)}`,
    `  Masterpieces:        ${nave.stellarMasterpieceCount}`,
    `  Nave Type:           ${nave.naveType}`,
    `  Condition:           ${colorNaveCondition(nave.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNavesTable(naves) */
export function formatNavesTable(naves: StellarNave[]): string {
  if (naves.length === 0) return chalk.dim('No stellar naves found')

  const lines: string[] = [chalk.bold('Stellar Naves'), '']

  for (const n of naves) {
    lines.push(
      `  ${chalk.rgb(255, 215, 0)(n.directory)}  ${colorScore(n.avgArchitecture)}  ${colorNaveCondition(n.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: StellarCathedralResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Stellar Cathedral Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Naves:              ${stats.totalNaves}`,
    `  Avg Cosmic Architecture:  ${colorScore(stats.avgCosmicArchitecture)}`,
    `  Avg Star Sanctity:        ${colorScore(stats.avgStarSanctity)}`,
    `  Avg Vault Clarity:        ${colorScore(stats.avgVaultClarity)}`,
    `  Avg Celestial Precision:  ${colorScore(stats.avgCelestialPrecision)}`,
    `  Avg Dawn Transcendence:   ${colorScore(stats.avgDawnTranscendence)}`,
    `  Stellar Masterpieces:     ${stats.stellarMasterpieceCount}`,
    `  Cosmic Perfection:        ${stats.cosmicPerfectionCount}`,
    `  Proper Star Temples:      ${stats.properStarTempleCount}`,
    `  Mortal Chapels:           ${stats.mortalChapelCount}`,
    `  Ruined Shrines:           ${stats.ruinedShrineCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Brilliance:       ${colorScore(stats.overallBrilliance)}`,
    `  Architect Grade:          ${stats.architectGrade}`,
    `  Best Pillar:              ${stats.bestPillar || 'N/A'}`,
    `  Best Architected:         ${stats.bestArchitected || 'N/A'}`,
    `  Most Sacred:              ${stats.mostSacred || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Transcendent:        ${stats.mostTranscendent || 'N/A'}`,
  ]
  if (stats.celebration) {
    lines.push('')
    lines.push(chalk.rgb(255, 215, 0)(stats.celebration))
  }
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: StellarCathedralResult): string {
  const lines: string[] = [
    chalk.bold('Stellar Cathedral Analysis'),
    '',
    formatPillarsTable(result.pillars),
    '',
    formatNavesTable(result.naves),
    '',
    chalk.bold('Cosmos Overview'),
    '',
    `  Avg Architecture:   ${colorScore(result.cosmos.avgArchitecture)}`,
    `  Avg Precision:      ${colorScore(result.cosmos.avgPrecision)}`,
    `  Avg Transcendence:  ${colorScore(result.cosmos.avgTranscendence)}`,
    `  Brilliance:         ${colorScore(result.cosmos.overallBrilliance)}`,
    `  Is Stellar:         ${result.cosmos.isStellar ? chalk.rgb(255, 215, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: StellarCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
