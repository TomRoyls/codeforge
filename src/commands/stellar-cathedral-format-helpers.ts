// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  StellarRadiance,
  StellarNave,
  StellarCathedralResult,
} from './stellar-cathedral-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 215, 0)(String(score))
  if (score >= 75) return chalk.rgb(100, 200, 255)(String(score))
  if (score >= 60) return chalk.rgb(100, 255, 150)(String(score))
  if (score >= 40) return chalk.rgb(255, 200, 100)(String(score))
  if (score >= 20) return chalk.rgb(255, 130, 100)(String(score))
  return chalk.rgb(180, 80, 80)(String(score))
}

export function colorGrade(condition: string): string {
  switch (condition) {
    case 'stellar-masterpiece': return chalk.rgb(255, 215, 0)(condition)
    case 'cosmic-temple': return chalk.rgb(100, 200, 255)(condition)
    case 'proper-sanctuary': return chalk.rgb(100, 255, 150)(condition)
    case 'fading-chapel': return chalk.rgb(255, 200, 100)(condition)
    case 'dark-ruin': return chalk.rgb(255, 130, 100)(condition)
    case 'void': return chalk.rgb(180, 80, 80)(condition)
    default: return condition
  }
}

// ─── Radiance Formatting ─────────────────────────────────

export function formatRadianceTable(r: StellarRadiance): string {
  const lines = [
    `  ${chalk.bold(r.file)}`,
    `    Cosmic Architecture: ${colorScore(r.cosmicArchitecture)}  Star Sanctity: ${colorScore(r.starSanctity)}`,
    `    Vault Clarity:       ${colorScore(r.vaultClarity)}  Celestial Precision: ${colorScore(r.celestialPrecision)}`,
    `    Dawn Transcendence:  ${colorScore(r.dawnTranscendence)}  Condition: ${colorGrade(r.condition)}`,
    `    Quality Score:       ${colorScore(r.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatRadiancesTable(radiances: StellarRadiance[]): string {
  if (radiances.length === 0) return chalk.dim('No stellar radiances found')
  return radiances.map(formatRadianceTable).join('\n\n')
}

// ─── Nave Formatting ─────────────────────────────────────

export function formatNaveTable(nave: StellarNave): string {
  const lines = [
    `  ${chalk.bold(nave.directory)}/`,
    `    Type: ${nave.naveType}  Condition: ${nave.condition}`,
    `    Avg Grandeur: ${nave.avgGrandeur}  Avg Precision: ${nave.avgPrecision}  Avg Transcendence: ${nave.avgTranscendence}`,
    `    Masterpieces: ${nave.stellarMasterpieceCount}  Void: ${nave.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatNavesTable(naves: StellarNave[]): string {
  if (naves.length === 0) return chalk.dim('No stellar naves found')
  return naves.map(formatNaveTable).join('\n\n')
}

// ─── Stats Formatting ────────────────────────────────────

export function formatStatsTable(stats: StellarCathedralResult['stats']): string {
  const lines = [
    chalk.bold('  Stellar Cathedral Statistics'),
    `    Total Files:            ${stats.totalFiles}`,
    `    Total Naves:            ${stats.totalNaves}`,
    `    Avg Cosmic Architecture:${stats.avgCosmicArchitecture}`,
    `    Avg Star Sanctity:      ${stats.avgStarSanctity}`,
    `    Avg Vault Clarity:      ${stats.avgVaultClarity}`,
    `    Avg Celestial Precision:${stats.avgCelestialPrecision}`,
    `    Avg Dawn Transcendence: ${stats.avgDawnTranscendence}`,
    `    Stellar Masterpieces:   ${stats.stellarMasterpieceCount}`,
    `    Cosmic Temples:         ${stats.cosmicTempleCount}`,
    `    Proper Sanctuaries:     ${stats.properSanctuaryCount}`,
    `    Fading Chapels:         ${stats.fadingChapelCount}`,
    `    Dark Ruins:             ${stats.darkRuinCount}`,
    `    Void:                   ${stats.voidCount}`,
    `    Overall Brilliance:     ${stats.overallBrilliance}`,
    `    Architect Grade:        ${stats.architectGrade}`,
    `    Best Radiance:          ${stats.bestRadiance}`,
    `    Most Grand:             ${stats.mostGrand}`,
    `    Most Sacred:            ${stats.mostSacred}`,
    `    Clearest:               ${stats.clearest}`,
    `    Most Precise:           ${stats.mostPrecise}`,
    `    Most Transcendent:      ${stats.mostTranscendent}`,
  ]
  return lines.join('\n')
}

// ─── Cosmos Formatting ───────────────────────────────────

export function formatCosmosTable(cosmos: StellarCathedralResult['cosmos']): string {
  const lines = [
    chalk.bold('  Cosmos Overview'),
    `    Avg Grandeur:      ${cosmos.avgGrandeur}`,
    `    Avg Precision:     ${cosmos.avgPrecision}`,
    `    Avg Transcendence: ${cosmos.avgTranscendence}`,
    `    Is Stellar:        ${cosmos.isStellar}`,
    `    Overall Brilliance:${cosmos.overallBrilliance}`,
  ]
  return lines.join('\n')
}

// ─── Celebration Formatting ──────────────────────────────

export function formatCelebration(celebration: StellarCathedralResult['celebration']): string {
  return chalk.rgb(255, 215, 0).bold(`\n  ★ Milestone #${celebration.milestone}: ${celebration.name} ★\n  ${celebration.message}\n`)
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ───────────────────────────────────

export function formatResultTable(result: StellarCathedralResult): string {
  const sections = [
    chalk.bold('\n★ Stellar Cathedral Analysis ★\n'),
    formatCelebration(result.celebration),
    chalk.bold('  Stellar Radiances'),
    formatRadiancesTable(result.radiances),
    '\n',
    chalk.bold('  Stellar Naves'),
    formatNavesTable(result.naves),
    '\n',
    formatCosmosTable(result.cosmos),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: StellarCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
