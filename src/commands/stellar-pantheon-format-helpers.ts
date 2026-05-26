import chalk from 'chalk'

import type { DeityGrade, StellarAltar, StellarCondition, StellarPantheonResult, StellarTemple, TempleCondition, TempleType } from './stellar-pantheon-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 140, 200)(String(score))
  if (score >= 75) return chalk.rgb(80, 120, 180)(String(score))
  if (score >= 60) return chalk.rgb(60, 100, 160)(String(score))
  if (score >= 40) return chalk.rgb(40, 70, 120)(String(score))
  if (score >= 20) return chalk.rgb(25, 45, 80)(String(score))
  return chalk.gray(String(score))
}

/** @example colorStellarCondition('stellar-masterpiece') */
export function colorStellarCondition(condition: StellarCondition | string): string {
  switch (condition) {
    case 'stellar-masterpiece': return chalk.rgb(100, 140, 200)('stellar-masterpiece')
    case 'divine-constellation': return chalk.rgb(80, 120, 180)('divine-constellation')
    case 'proper-star': return chalk.rgb(60, 100, 160)('proper-star')
    case 'dim-ember': return chalk.rgb(40, 70, 120)('dim-ember')
    case 'dark-void': return chalk.rgb(25, 45, 80)('dark-void')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorTempleType('grand-pantheon') */
export function colorTempleType(type: TempleType | string): string {
  switch (type) {
    case 'grand-pantheon': return chalk.rgb(100, 140, 200)('grand-pantheon')
    case 'star-temple': return chalk.rgb(80, 120, 180)('star-temple')
    case 'proper-shrine': return chalk.rgb(60, 100, 160)('proper-shrine')
    case 'stone-altar': return chalk.rgb(40, 70, 120)('stone-altar')
    case 'empty-pedestal': return chalk.rgb(25, 45, 80)('empty-pedestal')
    case 'no-temple': return chalk.gray('no-temple')
    default: return chalk.gray(String(type))
  }
}

/** @example colorTempleCondition('stellar-palace') */
export function colorTempleCondition(condition: TempleCondition | string): string {
  switch (condition) {
    case 'stellar-palace': return chalk.rgb(100, 140, 200)('stellar-palace')
    case 'cosmic-temple': return chalk.rgb(80, 120, 180)('cosmic-temple')
    case 'proper-observatory': return chalk.rgb(60, 100, 160)('proper-observatory')
    case 'stone-circle': return chalk.rgb(40, 70, 120)('stone-circle')
    case 'empty-field': return chalk.rgb(25, 45, 80)('empty-field')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorDeityGrade('cosmic-deity') */
export function colorDeityGrade(grade: DeityGrade | string): string {
  switch (grade) {
    case 'cosmic-deity': return chalk.rgb(100, 140, 200)('cosmic-deity')
    case 'star-god': return chalk.rgb(80, 120, 180)('star-god')
    case 'proper-demiurge': return chalk.rgb(60, 100, 160)('proper-demiurge')
    case 'mortal-builder': return chalk.rgb(40, 70, 120)('mortal-builder')
    case 'apprentice': return chalk.rgb(25, 45, 80)('apprentice')
    case 'stardust': return chalk.gray('stardust')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatAltarTable(altar) */
export function formatAltarTable(altar: StellarAltar): string {
  const lines: string[] = [
    chalk.bold(`Stellar Altar: ${altar.file}`),
    '',
    `  Divine Architecture:     ${colorScore(altar.divineArchitecture)}  ${chalk.dim(`(${altar.designing.temple})`)}`,
    `  Constellation Precision: ${colorScore(altar.constellationPrecision)}  ${chalk.dim(`(${altar.aligning.stars})`)}`,
    `  Supernova Resilience:    ${colorScore(altar.supernovaResilience)}  ${chalk.dim(`(${altar.surviving.remnant})`)}`,
    `  Cosmic Clarity:          ${colorScore(altar.cosmicClarity)}  ${chalk.dim(`(${altar.revealing.void})`)}`,
    `  Celestial Wisdom:        ${colorScore(altar.celestialWisdom)}  ${chalk.dim(`(${altar.understanding.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(altar.qualityScore)}  ${chalk.dim(`(${altar.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatAltarsTable(altars) */
export function formatAltarsTable(altars: StellarAltar[]): string {
  if (altars.length === 0) return chalk.dim('No stellar altars found')
  const lines: string[] = [chalk.bold('Stellar Altars'), '']
  for (const a of altars) {
    lines.push(`  ${chalk.rgb(100, 140, 200)(a.file)}  Arch:${colorScore(a.divineArchitecture)}  Prec:${colorScore(a.constellationPrecision)}  Score:${colorScore(a.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatTempleTable(temple) */
export function formatTempleTable(temple: StellarTemple): string {
  const lines: string[] = [
    chalk.bold(`Stellar Temple: ${temple.directory}`),
    '',
    `  Altars:            ${temple.altars.length}`,
    `  Avg Architecture:  ${colorScore(temple.avgArchitecture)}`,
    `  Avg Precision:     ${colorScore(temple.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(temple.avgWisdom)}`,
    `  Masterpieces:      ${temple.stellarMasterpieceCount}`,
    `  Temple Type:       ${colorTempleType(temple.templeType)}`,
    `  Condition:         ${colorTempleCondition(temple.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatTemplesTable(temples) */
export function formatTemplesTable(temples: StellarTemple[]): string {
  if (temples.length === 0) return chalk.dim('No stellar temples found')
  const lines: string[] = [chalk.bold('Stellar Temples'), '']
  for (const t of temples) {
    lines.push(`  ${chalk.rgb(100, 140, 200)(t.directory)}  ${colorScore(t.avgArchitecture)}  ${colorTempleCondition(t.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: StellarPantheonResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Stellar Pantheon Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Temples:             ${stats.totalTemples}`,
    `  Avg Divine Architecture:   ${colorScore(stats.avgDivineArchitecture)}`,
    `  Avg Constellation Prec.:   ${colorScore(stats.avgConstellationPrecision)}`,
    `  Avg Supernova Resilience:  ${colorScore(stats.avgSupernovaResilience)}`,
    `  Avg Cosmic Clarity:        ${colorScore(stats.avgCosmicClarity)}`,
    `  Avg Celestial Wisdom:      ${colorScore(stats.avgCelestialWisdom)}`,
    `  Stellar Masterpieces:      ${stats.stellarMasterpieceCount}`,
    `  Divine Constellations:     ${stats.divineConstellationCount}`,
    `  Proper Stars:              ${stats.properStarCount}`,
    `  Dim Embers:                ${stats.dimEmberCount}`,
    `  Dark Voids:                ${stats.darkVoidCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Divinity:          ${colorScore(stats.overallDivinity)}`,
    `  Deity Grade:               ${colorDeityGrade(stats.deityGrade)}`,
    `  Best Altar:                ${stats.bestAltar || 'N/A'}`,
    `  Most Architectural:        ${stats.mostArchitectural || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:            ${stats.mostResilient || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  if (stats.celebration) {
    lines.push('', chalk.rgb(100, 140, 200)(stats.celebration))
  }
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(100, 140, 200)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: StellarPantheonResult): string {
  const lines: string[] = [
    chalk.bold('Stellar Pantheon Analysis'),
    '',
    formatAltarsTable(result.altars),
    '',
    formatTemplesTable(result.temples),
    '',
    chalk.bold('Cosmos Overview'),
    '',
    `  Avg Architecture:     ${colorScore(result.cosmos.avgArchitecture)}`,
    `  Avg Precision:        ${colorScore(result.cosmos.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(result.cosmos.avgWisdom)}`,
    `  Overall Divinity:     ${colorScore(result.cosmos.overallDivinity)}`,
    `  Is Stellar:           ${result.cosmos.isStellar ? chalk.rgb(100, 140, 200)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  if (result.celebration) {
    lines.push('', chalk.rgb(100, 140, 200).bold(result.celebration))
  }
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: StellarPantheonResult): string {
  return JSON.stringify(result, null, 2)
}
