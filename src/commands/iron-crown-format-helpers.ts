// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  IronJewel,
  IronThrone,
  IronCrownResult,
} from './iron-crown-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 160, 120)(String(score))
  if (score >= 75) return chalk.rgb(160, 140, 100)(String(score))
  if (score >= 60) return chalk.rgb(140, 130, 100)(String(score))
  if (score >= 40) return chalk.rgb(200, 180, 140)(String(score))
  if (score >= 20) return chalk.rgb(200, 140, 120)(String(score))
  return chalk.rgb(160, 100, 100)(String(score))
}

export function colorCondition(condition: string): string {
  switch (condition) {
    case 'imperial-crown': return chalk.rgb(180, 160, 120)(condition)
    case 'royal-diadem': return chalk.rgb(160, 140, 100)(condition)
    case 'proper-circlet': return chalk.rgb(140, 130, 100)(condition)
    case 'tarnished-band': return chalk.rgb(200, 180, 140)(condition)
    case 'broken-crown': return chalk.rgb(200, 140, 120)(condition)
    case 'void': return chalk.rgb(160, 100, 100)(condition)
    default: return condition
  }
}

// ─── Jewel Formatting ────────────────────────────────────

export function formatJewelTable(j: IronJewel): string {
  const lines = [
    `  ${chalk.bold(j.file)}`,
    `    Sovereign Strength:  ${colorScore(j.sovereignStrength)}  Crown Authority:  ${colorScore(j.crownAuthority)}`,
    `    Jewel Precision:     ${colorScore(j.jewelPrecision)}  Circlet Resilience: ${colorScore(j.circletResilience)}`,
    `    Reign Endurance:     ${colorScore(j.reignEndurance)}  Condition: ${colorCondition(j.condition)}`,
    `    Quality Score:       ${colorScore(j.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatJewelsTable(jewels: IronJewel[]): string {
  if (jewels.length === 0) return chalk.dim('No iron jewels found')
  return jewels.map(formatJewelTable).join('\n\n')
}

// ─── Throne Formatting ───────────────────────────────────

export function formatThroneTable(throne: IronThrone): string {
  const lines = [
    `  ${chalk.bold(throne.directory)}/`,
    `    Throne Type: ${throne.throneType}  Condition: ${throne.condition}`,
    `    Avg Strength: ${throne.avgStrength}  Avg Precision: ${throne.avgPrecision}  Avg Endurance: ${throne.avgEndurance}`,
    `    Imperial Crowns: ${throne.imperialCrownCount}  Void: ${throne.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatThronesTable(thrones: IronThrone[]): string {
  if (thrones.length === 0) return chalk.dim('No iron thrones found')
  return thrones.map(formatThroneTable).join('\n\n')
}

// ─── Stats Formatting ────────────────────────────────────

export function formatStatsTable(stats: IronCrownResult['stats']): string {
  const lines = [
    chalk.bold('  Iron Crown Statistics'),
    `    Total Files:            ${stats.totalFiles}`,
    `    Total Thrones:          ${stats.totalThrones}`,
    `    Avg Sovereign Strength: ${stats.avgSovereignStrength}`,
    `    Avg Crown Authority:    ${stats.avgCrownAuthority}`,
    `    Avg Jewel Precision:    ${stats.avgJewelPrecision}`,
    `    Avg Circlet Resilience: ${stats.avgCircletResilience}`,
    `    Avg Reign Endurance:    ${stats.avgReignEndurance}`,
    `    Imperial Crowns:        ${stats.imperialCrownCount}`,
    `    Royal Diadems:          ${stats.royalDiademCount}`,
    `    Proper Circlets:        ${stats.properCircletCount}`,
    `    Tarnished Bands:        ${stats.tarnishedBandCount}`,
    `    Broken Crowns:          ${stats.brokenCrownCount}`,
    `    Void:                   ${stats.voidCount}`,
    `    Overall Sovereignty:    ${stats.overallSovereignty}`,
    `    Monarch Grade:          ${stats.monarchGrade}`,
    `    Best Jewel:             ${stats.bestJewel}`,
    `    Strongest:              ${stats.strongest}`,
    `    Most Authoritative:     ${stats.mostAuthoritative}`,
    `    Most Precise:           ${stats.mostPrecise}`,
    `    Most Resilient:         ${stats.mostResilient}`,
    `    Most Enduring:          ${stats.mostEnduring}`,
  ]
  return lines.join('\n')
}

// ─── Kingdom Formatting ──────────────────────────────────

export function formatKingdomTable(kingdom: IronCrownResult['kingdom']): string {
  const lines = [
    chalk.bold('  Kingdom Overview'),
    `    Avg Strength:       ${kingdom.avgStrength}`,
    `    Avg Precision:      ${kingdom.avgPrecision}`,
    `    Avg Endurance:      ${kingdom.avgEndurance}`,
    `    Is Imperial:        ${kingdom.isImperial}`,
    `    Overall Sovereignty:${kingdom.overallSovereignty}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ───────────────────────────────────

export function formatResultTable(result: IronCrownResult): string {
  const sections = [
    chalk.bold('\n◎ Iron Crown Analysis ◎\n'),
    chalk.bold('  Iron Jewels'),
    formatJewelsTable(result.jewels),
    '\n',
    chalk.bold('  Iron Thrones'),
    formatThronesTable(result.thrones),
    '\n',
    formatKingdomTable(result.kingdom),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: IronCrownResult): string {
  return JSON.stringify(result, null, 2)
}
