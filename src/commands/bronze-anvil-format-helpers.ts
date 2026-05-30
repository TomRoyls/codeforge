import chalk from 'chalk'

import type { WorkshopCondition, IngotCondition, BronzeIngot, BronzeWorkshop, BronzeForgeStats, BronzeForgeResult } from './bronze-anvil-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(205, 127, 50)(String(score))
  if (score >= 75) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 60) return chalk.rgb(218, 165, 32)(String(score))
  if (score >= 40) return chalk.rgb(160, 120, 40)(String(score))
  if (score >= 20) return chalk.rgb(120, 90, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('bronze-masterpiece') */
export function colorCondition(condition: IngotCondition | string): string {
  switch (condition) {
    case 'bronze-masterpiece':
      return chalk.rgb(205, 127, 50)('bronze-masterpiece')
    case 'golden-alloy':
      return chalk.rgb(218, 165, 32)('golden-alloy')
    case 'proper-metal':
      return chalk.rgb(184, 115, 51)('proper-metal')
    case 'tarnished-brass':
      return chalk.rgb(160, 120, 40)('tarnished-brass')
    case 'rusted-iron':
      return chalk.rgb(120, 90, 30)('rusted-iron')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorWorkshopCondition('ancient-foundry') */
export function colorWorkshopCondition(condition: WorkshopCondition | string): string {
  switch (condition) {
    case 'ancient-foundry':
      return chalk.rgb(205, 127, 50)('ancient-foundry')
    case 'bronze-workshop':
      return chalk.rgb(218, 165, 32)('bronze-workshop')
    case 'proper-forge':
      return chalk.rgb(184, 115, 51)('proper-forge')
    case 'dying-ember':
      return chalk.rgb(160, 120, 40)('dying-ember')
    case 'cold-anvil':
      return chalk.rgb(120, 90, 30)('cold-anvil')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatIngotTable(ingot) */
export function formatIngotTable(ingot: BronzeIngot): string {
  const lines: string[] = [
    chalk.bold(`Bronze Ingot: ${ingot.file}`),
    '',
    `  Alloy Strength:    ${colorScore(ingot.alloyStrength)}  ${chalk.dim(`(${ingot.smelting.metal})`)}`,
    `  Patina Wisdom:     ${colorScore(ingot.patinaWisdom)}  ${chalk.dim(`(${ingot.aging.patina})`)}`,
    `  Dawn Clarity:      ${colorScore(ingot.dawnClarity)}  ${chalk.dim(`(${ingot.kindling.dawn})`)}`,
    `  Forge Precision:   ${colorScore(ingot.forgePrecision)}  ${chalk.dim(`(${ingot.hammering.craft})`)}`,
    `  Durable Current:   ${colorScore(ingot.durableCurrent)}  ${chalk.dim(`(${ingot.flowing.flow})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${colorCondition(ingot.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: BronzeIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No bronze ingots found')

  const colWidths = {
    file: Math.max(4, ...ingots.map((p) => p.file.length)),
    str: Math.max(3, ...ingots.map((p) => String(p.alloyStrength).length)),
    wis: Math.max(4, ...ingots.map((p) => String(p.patinaWisdom).length)),
    clar: Math.max(5, ...ingots.map((p) => String(p.dawnClarity).length)),
    prec: Math.max(4, ...ingots.map((p) => String(p.forgePrecision).length)),
    curr: Math.max(5, ...ingots.map((p) => String(p.durableCurrent).length)),
    score: Math.max(5, ...ingots.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Bronze Ingots'), '']

  const header =
    chalk.rgb(205, 127, 50)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Curr', colWidths.curr)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of ingots) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.alloyStrength), colWidths.str) +
        '  ' +
        padLeft(String(p.patinaWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(p.dawnClarity), colWidths.clar) +
        '  ' +
        padLeft(String(p.forgePrecision), colWidths.prec) +
        '  ' +
        padLeft(String(p.durableCurrent), colWidths.curr) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatWorkshopTable(workshop) */
export function formatWorkshopTable(workshop: BronzeWorkshop): string {
  const lines: string[] = [
    chalk.bold(`Bronze Workshop: ${workshop.directory}`),
    '',
    `  Ingots:          ${workshop.ingots.length}`,
    `  Avg Strength:    ${colorScore(workshop.avgStrength)}`,
    `  Avg Precision:   ${colorScore(workshop.avgPrecision)}`,
    `  Avg Current:     ${colorScore(workshop.avgCurrent)}`,
    `  Masterpieces:    ${workshop.bronzeMasterpieceCount}`,
    `  Workshop Type:   ${workshop.workshopType}`,
    `  Condition:       ${colorWorkshopCondition(workshop.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatWorkshopsTable(workshops) */
export function formatWorkshopsTable(workshops: BronzeWorkshop[]): string {
  if (workshops.length === 0) return chalk.dim('No bronze workshops found')

  const lines: string[] = [chalk.bold('Bronze Workshops'), '']

  for (const w of workshops) {
    lines.push(
      `  ${chalk.rgb(205, 127, 50)(w.directory)}  ${colorScore(w.avgStrength)}  ${colorWorkshopCondition(w.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: BronzeForgeStats): string {
  const lines: string[] = [
    chalk.bold('Bronze Forge Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Workshops:      ${stats.totalWorkshops}`,
    `  Avg Alloy Strength:   ${colorScore(stats.avgAlloyStrength)}`,
    `  Avg Patina Wisdom:    ${colorScore(stats.avgPatinaWisdom)}`,
    `  Avg Dawn Clarity:     ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Forge Precision:  ${colorScore(stats.avgForgePrecision)}`,
    `  Avg Durable Current:  ${colorScore(stats.avgDurableCurrent)}`,
    `  Bronze Masterpieces:  ${stats.bronzeMasterpieceCount}`,
    `  Golden Alloy:         ${stats.goldenAlloyCount}`,
    `  Proper Metal:         ${stats.properMetalCount}`,
    `  Tarnished Brass:      ${stats.tarnishedBrassCount}`,
    `  Rusted Iron:          ${stats.rustedIronCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Craft:        ${colorScore(stats.overallCraft)}`,
    `  Smith Grade:          ${stats.smithGrade}`,
    `  Best Ingot:           ${stats.bestIngot || 'N/A'}`,
    `  Strongest:            ${stats.strongest || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
    `  Clearest:             ${stats.clearest || 'N/A'}`,
    `  Most Precise:         ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:        ${stats.mostEnduring || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(205, 127, 50)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: BronzeForgeResult): string {
  const lines: string[] = [
    chalk.bold('Bronze Forge Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatWorkshopsTable(result.workshops),
    '',
    chalk.bold('Foundry Overview'),
    '',
    `  Avg Strength:     ${colorScore(result.foundry.avgStrength)}`,
    `  Avg Precision:    ${colorScore(result.foundry.avgPrecision)}`,
    `  Avg Current:      ${colorScore(result.foundry.avgCurrent)}`,
    `  Overall Craft:    ${colorScore(result.foundry.overallCraft)}`,
    `  Is Bronze:        ${result.foundry.isBronze ? chalk.rgb(205, 127, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: BronzeForgeResult): string {
  return JSON.stringify(result, null, 2)
}
