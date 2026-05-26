import chalk from 'chalk'

import type { AstronomerGrade, ConstellationCondition, ConstellationType, PrayerCondition, StarlightCathedralResult, StarlightConstellation, StarlightPrayer } from './starlight-cathedral-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 223, 100)(String(score))
  if (score >= 75) return chalk.rgb(255, 200, 80)(String(score))
  if (score >= 60) return chalk.rgb(220, 180, 60)(String(score))
  if (score >= 40) return chalk.rgb(180, 150, 50)(String(score))
  if (score >= 20) return chalk.rgb(140, 120, 40)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPrayerCondition('starlight-masterpiece') */
export function colorPrayerCondition(condition: PrayerCondition | string): string {
  switch (condition) {
    case 'starlight-masterpiece': return chalk.rgb(255, 223, 100)('starlight-masterpiece')
    case 'celestial-gem': return chalk.rgb(255, 200, 80)('celestial-gem')
    case 'proper-star': return chalk.rgb(220, 180, 60)('proper-star')
    case 'dim-ember': return chalk.rgb(180, 150, 50)('dim-ember')
    case 'dark-void': return chalk.rgb(140, 120, 40)('dark-void')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorConstellationType('grand-constellation') */
export function colorConstellationType(type: ConstellationType | string): string {
  switch (type) {
    case 'grand-constellation': return chalk.rgb(255, 223, 100)('grand-constellation')
    case 'star-cluster': return chalk.rgb(255, 200, 80)('star-cluster')
    case 'proper-pattern': return chalk.rgb(220, 180, 60)('proper-pattern')
    case 'scattered-stars': return chalk.rgb(180, 150, 50)('scattered-stars')
    case 'empty-space': return chalk.rgb(140, 120, 40)('empty-space')
    case 'no-constellation': return chalk.gray('no-constellation')
    default: return chalk.gray(String(type))
  }
}

/** @example colorConstellationCondition('starlight-palace') */
export function colorConstellationCondition(condition: ConstellationCondition | string): string {
  switch (condition) {
    case 'starlight-palace': return chalk.rgb(255, 223, 100)('starlight-palace')
    case 'cosmic-temple': return chalk.rgb(255, 200, 80)('cosmic-temple')
    case 'proper-observatory': return chalk.rgb(220, 180, 60)('proper-observatory')
    case 'stone-tower': return chalk.rgb(180, 150, 50)('stone-tower')
    case 'dark-room': return chalk.rgb(140, 120, 40)('dark-room')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorAstronomerGrade('cosmic-high-priest') */
export function colorAstronomerGrade(grade: AstronomerGrade | string): string {
  switch (grade) {
    case 'cosmic-high-priest': return chalk.rgb(255, 223, 100)('cosmic-high-priest')
    case 'star-bishop': return chalk.rgb(255, 200, 80)('star-bishop')
    case 'proper-deacon': return chalk.rgb(220, 180, 60)('proper-deacon')
    case 'acolyte': return chalk.rgb(180, 150, 50)('acolyte')
    case 'novice': return chalk.rgb(140, 120, 40)('novice')
    case 'uninitiated': return chalk.gray('uninitiated')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPrayerTable(prayer) */
export function formatPrayerTable(prayer: StarlightPrayer): string {
  const lines: string[] = [
    chalk.bold(`Starlight Prayer: ${prayer.file}`),
    '',
    `  Celestial Luminescence:  ${colorScore(prayer.celestialLuminescence)}  ${chalk.dim(`(${prayer.shining.light})`)}`,
    `  Stellar Architecture:   ${colorScore(prayer.stellarArchitecture)}  ${chalk.dim(`(${prayer.building.structure})`)}`,
    `  Cosmic Precision:       ${colorScore(prayer.cosmicPrecision)}  ${chalk.dim(`(${prayer.aligning.alignment})`)}`,
    `  Interstellar Endurance:  ${colorScore(prayer.interstellarEndurance)}  ${chalk.dim(`(${prayer.enduring.eternity})`)}`,
    `  Astral Wisdom:          ${colorScore(prayer.astralWisdom)}  ${chalk.dim(`(${prayer.understanding.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(prayer.qualityScore)}  ${chalk.dim(`(${prayer.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPrayersTable(prayers) */
export function formatPrayersTable(prayers: StarlightPrayer[]): string {
  if (prayers.length === 0) return chalk.dim('No starlight prayers found')
  const lines: string[] = [chalk.bold('Starlight Prayers'), '']
  for (const p of prayers) {
    lines.push(`  ${chalk.rgb(255, 223, 100)(p.file)}  Lum:${colorScore(p.celestialLuminescence)}  Arch:${colorScore(p.stellarArchitecture)}  Score:${colorScore(p.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatConstellationTable(constellation) */
export function formatConstellationTable(constellation: StarlightConstellation): string {
  const lines: string[] = [
    chalk.bold(`Starlight Constellation: ${constellation.directory}`),
    '',
    `  Prayers:           ${constellation.prayers.length}`,
    `  Avg Luminescence:  ${colorScore(constellation.avgLuminescence)}`,
    `  Avg Precision:     ${colorScore(constellation.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(constellation.avgWisdom)}`,
    `  Masterpieces:      ${constellation.starlightMasterpieceCount}`,
    `  Type:              ${colorConstellationType(constellation.constellationType)}`,
    `  Condition:         ${colorConstellationCondition(constellation.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatConstellationsTable(constellations) */
export function formatConstellationsTable(constellations: StarlightConstellation[]): string {
  if (constellations.length === 0) return chalk.dim('No starlight constellations found')
  const lines: string[] = [chalk.bold('Starlight Constellations'), '']
  for (const c of constellations) {
    lines.push(`  ${chalk.rgb(255, 223, 100)(c.directory)}  ${colorScore(c.avgLuminescence)}  ${colorConstellationCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: StarlightCathedralResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Starlight Cathedral Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Constellations:      ${stats.totalConstellations}`,
    `  Avg Celestial Luminescence: ${colorScore(stats.avgCelestialLuminescence)}`,
    `  Avg Stellar Architecture:  ${colorScore(stats.avgStellarArchitecture)}`,
    `  Avg Cosmic Precision:      ${colorScore(stats.avgCosmicPrecision)}`,
    `  Avg Interstellar Endurance: ${colorScore(stats.avgInterstellarEndurance)}`,
    `  Avg Astral Wisdom:         ${colorScore(stats.avgAstralWisdom)}`,
    `  Starlight Masterpieces:    ${stats.starlightMasterpieceCount}`,
    `  Celestial Gems:            ${stats.celestialGemCount}`,
    `  Proper Stars:              ${stats.properStarCount}`,
    `  Dim Embers:                ${stats.dimEmberCount}`,
    `  Dark Voids:                ${stats.darkVoidCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Radiance:          ${colorScore(stats.overallRadiance)}`,
    `  Astronomer Grade:          ${colorAstronomerGrade(stats.astronomerGrade)}`,
    `  Best Prayer:               ${stats.bestPrayer || 'N/A'}`,
    `  Brightest:                 ${stats.brightest || 'N/A'}`,
    `  Most Structured:           ${stats.mostStructured || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:             ${stats.mostEnduring || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 223, 100)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: StarlightCathedralResult): string {
  const lines: string[] = [
    chalk.bold('Starlight Cathedral Analysis'),
    '',
    formatPrayersTable(result.prayers),
    '',
    formatConstellationsTable(result.constellations),
    '',
    chalk.bold('Cathedral Overview'),
    '',
    `  Avg Luminescence:  ${colorScore(result.cathedral.avgLuminescence)}`,
    `  Avg Precision:     ${colorScore(result.cathedral.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.cathedral.avgWisdom)}`,
    `  Overall Radiance:  ${colorScore(result.cathedral.overallRadiance)}`,
    `  Is Starlight:      ${result.cathedral.isStarlight ? chalk.rgb(255, 223, 100)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: StarlightCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
