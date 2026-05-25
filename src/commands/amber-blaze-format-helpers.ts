// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  AmberGlow,
  AmberHearth,
  AmberEmberResult,
} from './amber-blaze-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(220, 160, 80)(String(score))
  if (score >= 75) return chalk.rgb(200, 140, 70)(String(score))
  if (score >= 60) return chalk.rgb(180, 130, 60)(String(score))
  if (score >= 40) return chalk.rgb(160, 120, 80)(String(score))
  if (score >= 20) return chalk.rgb(140, 100, 80)(String(score))
  return chalk.rgb(120, 80, 80)(String(score))
}

export function colorCondition(condition: string): string {
  switch (condition) {
    case 'amber-masterpiece': return chalk.rgb(220, 160, 80)(condition)
    case 'golden-ember': return chalk.rgb(200, 140, 70)(condition)
    case 'proper-glow': return chalk.rgb(180, 130, 60)(condition)
    case 'cool-stone': return chalk.rgb(160, 120, 80)(condition)
    case 'dead-ash': return chalk.rgb(140, 100, 80)(condition)
    case 'void': return chalk.rgb(120, 80, 80)(condition)
    default: return condition
  }
}

// ─── Glow Formatting ────────────────────────────────────

export function formatGlowTable(g: AmberGlow): string {
  const lines = [
    `  ${chalk.bold(g.file)}`,
    `    Preservation Warmth: ${colorScore(g.preservationWarmth)}  Glow Clarity:      ${colorScore(g.glowClarity)}`,
    `    Fire Persistence:    ${colorScore(g.firePersistence)}  Ash Wisdom:        ${colorScore(g.ashWisdom)}`,
    `    Resin Strength:      ${colorScore(g.resinStrength)}  Condition: ${colorCondition(g.condition)}`,
    `    Quality Score:       ${colorScore(g.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatGlowsTable(glows: AmberGlow[]): string {
  if (glows.length === 0) return chalk.dim('No amber glows found')
  return glows.map(formatGlowTable).join('\n\n')
}

// ─── Hearth Formatting ──────────────────────────────────

export function formatHearthTable(hearth: AmberHearth): string {
  const lines = [
    `  ${chalk.bold(hearth.directory)}/`,
    `    Hearth Type: ${hearth.hearthType}  Condition: ${hearth.condition}`,
    `    Avg Warmth: ${hearth.avgWarmth}  Avg Persistence: ${hearth.avgPersistence}  Avg Strength: ${hearth.avgStrength}`,
    `    Amber Masterpieces: ${hearth.amberMasterpieceCount}  Void: ${hearth.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatHearthsTable(hearths: AmberHearth[]): string {
  if (hearths.length === 0) return chalk.dim('No amber hearths found')
  return hearths.map(formatHearthTable).join('\n\n')
}

// ─── Stats Formatting ───────────────────────────────────

export function formatStatsTable(stats: AmberEmberResult['stats']): string {
  const lines = [
    chalk.bold('  Amber Ember Statistics'),
    `    Total Files:            ${stats.totalFiles}`,
    `    Total Hearths:          ${stats.totalHearths}`,
    `    Avg Preservation Warmth:${stats.avgPreservationWarmth}`,
    `    Avg Glow Clarity:       ${stats.avgGlowClarity}`,
    `    Avg Fire Persistence:   ${stats.avgFirePersistence}`,
    `    Avg Ash Wisdom:         ${stats.avgAshWisdom}`,
    `    Avg Resin Strength:     ${stats.avgResinStrength}`,
    `    Amber Masterpieces:     ${stats.amberMasterpieceCount}`,
    `    Golden Embers:          ${stats.goldenEmberCount}`,
    `    Proper Glows:           ${stats.properGlowCount}`,
    `    Cool Stones:            ${stats.coolStoneCount}`,
    `    Dead Ashes:             ${stats.deadAshCount}`,
    `    Void:                   ${stats.voidCount}`,
    `    Overall Radiance:       ${stats.overallRadiance}`,
    `    Keeper Grade:           ${stats.keeperGrade}`,
    `    Best Glow:              ${stats.bestGlow}`,
    `    Warmest:                ${stats.warmest}`,
    `    Clearest:               ${stats.clearest}`,
    `    Most Persistent:        ${stats.mostPersistent}`,
    `    Wisest:                 ${stats.wisest}`,
    `    Strongest:              ${stats.strongest}`,
  ]
  return lines.join('\n')
}

// ─── Fire Formatting ────────────────────────────────────

export function formatFireTable(fire: AmberEmberResult['fire']): string {
  const lines = [
    chalk.bold('  Fire Overview'),
    `    Avg Warmth:       ${fire.avgWarmth}`,
    `    Avg Persistence:  ${fire.avgPersistence}`,
    `    Avg Strength:     ${fire.avgStrength}`,
    `    Is Amber:         ${fire.isAmber}`,
    `    Overall Radiance: ${fire.overallRadiance}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ──────────────────────────────────

export function formatResultTable(result: AmberEmberResult): string {
  const sections = [
    chalk.bold('\n◎ Amber Ember Analysis ◎\n'),
    chalk.bold('  Amber Glows'),
    formatGlowsTable(result.glows),
    '\n',
    chalk.bold('  Amber Hearths'),
    formatHearthsTable(result.hearths),
    '\n',
    formatFireTable(result.fire),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: AmberEmberResult): string {
  return JSON.stringify(result, null, 2)
}
