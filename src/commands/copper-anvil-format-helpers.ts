import chalk from 'chalk'

import type { IngotCondition, WorkshopCondition, BronzeIngot, BronzeAnvilResult, BronzeWorkshop } from './copper-anvil-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(205, 127, 50)(String(score))
  if (score >= 75) return chalk.rgb(180, 110, 45)(String(score))
  if (score >= 60) return chalk.rgb(155, 95, 40)(String(score))
  if (score >= 40) return chalk.rgb(130, 80, 35)(String(score))
  if (score >= 20) return chalk.rgb(105, 65, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorIngotCondition('bronze-masterpiece') */
export function colorIngotCondition(condition: IngotCondition | string): string {
  switch (condition) {
    case 'bronze-masterpiece':
      return chalk.rgb(205, 127, 50)('bronze-masterpiece')
    case 'ageless-alloy':
      return chalk.rgb(180, 110, 45)('ageless-alloy')
    case 'proper-bronze':
      return chalk.rgb(155, 95, 40)('proper-bronze')
    case 'tarnished-metal':
      return chalk.rgb(130, 80, 35)('tarnished-metal')
    case 'raw-ore':
      return chalk.rgb(105, 65, 30)('raw-ore')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorWorkshopCondition('master-smithy') */
export function colorWorkshopCondition(condition: WorkshopCondition | string): string {
  switch (condition) {
    case 'master-smithy':
      return chalk.rgb(205, 127, 50)('master-smithy')
    case 'bronze-hall':
      return chalk.rgb(180, 110, 45)('bronze-hall')
    case 'proper-workshop':
      return chalk.rgb(155, 95, 40)('proper-workshop')
    case 'rusty-shed':
      return chalk.rgb(130, 80, 35)('rusty-shed')
    case 'empty-lot':
      return chalk.rgb(105, 65, 30)('empty-lot')
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
    `  Alloy Strength:     ${colorScore(ingot.alloyStrength)}  ${chalk.dim(`(${ingot.alloying.alloy})`)}`,
    `  Patina Wisdom:      ${colorScore(ingot.patinaWisdom)}  ${chalk.dim(`(${ingot.aging.patina})`)}`,
    `  Dawn Clarity:       ${colorScore(ingot.dawnClarity)}  ${chalk.dim(`(${ingot.revealing.dawn})`)}`,
    `  Forge Precision:    ${colorScore(ingot.forgePrecision)}  ${chalk.dim(`(${ingot.hammering.hammer})`)}`,
    `  Durable Current:    ${colorScore(ingot.durableCurrent)}  ${chalk.dim(`(${ingot.conducting.flow})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${colorIngotCondition(ingot.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: BronzeIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No bronze ingots found')

  const colWidths = {
    file: Math.max(4, ...ingots.map((i) => i.file.length)),
    str: Math.max(4, ...ingots.map((i) => String(i.alloyStrength).length)),
    wis: Math.max(4, ...ingots.map((i) => String(i.patinaWisdom).length)),
    clr: Math.max(4, ...ingots.map((i) => String(i.dawnClarity).length)),
    prc: Math.max(4, ...ingots.map((i) => String(i.forgePrecision).length)),
    cur: Math.max(4, ...ingots.map((i) => String(i.durableCurrent).length)),
    score: Math.max(5, ...ingots.map((i) => String(i.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Bronze Ingots'), '']

  const header =
    chalk.rgb(205, 127, 50)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Prc', colWidths.prc)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Cur', colWidths.cur)) +
    '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const i of ingots) {
    lines.push(
      padRight(i.file, colWidths.file) +
        '  ' +
        padLeft(String(i.alloyStrength), colWidths.str) +
        '  ' +
        padLeft(String(i.patinaWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(i.dawnClarity), colWidths.clr) +
        '  ' +
        padLeft(String(i.forgePrecision), colWidths.prc) +
        '  ' +
        padLeft(String(i.durableCurrent), colWidths.cur) +
        '  ' +
        padLeft(String(i.qualityScore), colWidths.score),
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
    `  Avg Wisdom:      ${colorScore(workshop.avgWisdom)}`,
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
export function formatStatsTable(stats: BronzeAnvilResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Bronze Anvil Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Workshops:        ${stats.totalWorkshops}`,
    `  Avg Alloy Strength:     ${colorScore(stats.avgAlloyStrength)}`,
    `  Avg Patina Wisdom:      ${colorScore(stats.avgPatinaWisdom)}`,
    `  Avg Dawn Clarity:       ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Forge Precision:    ${colorScore(stats.avgForgePrecision)}`,
    `  Avg Durable Current:    ${colorScore(stats.avgDurableCurrent)}`,
    `  Bronze Masterpieces:    ${stats.bronzeMasterpieceCount}`,
    `  Ageless Alloy:          ${stats.agelessAlloyCount}`,
    `  Proper Bronze:          ${stats.properBronzeCount}`,
    `  Tarnished Metal:        ${stats.tarnishedMetalCount}`,
    `  Raw Ore:                ${stats.rawOreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Temper:         ${colorScore(stats.overallTemper)}`,
    `  Smith Grade:            ${stats.smithGrade}`,
    `  Best Ingot:             ${stats.bestIngot || 'N/A'}`,
    `  Strongest:              ${stats.strongest || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:          ${stats.mostEnduring || 'N/A'}`,
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
export function formatResultTable(result: BronzeAnvilResult): string {
  const lines: string[] = [
    chalk.bold('Bronze Anvil Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatWorkshopsTable(result.workshops),
    '',
    chalk.bold('Foundry Overview'),
    '',
    `  Avg Strength:   ${colorScore(result.foundry.avgStrength)}`,
    `  Avg Precision:  ${colorScore(result.foundry.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.foundry.avgWisdom)}`,
    `  Temper:         ${colorScore(result.foundry.overallTemper)}`,
    `  Is Bronze:      ${result.foundry.isBronze ? chalk.rgb(205, 127, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: BronzeAnvilResult): string {
  return JSON.stringify(result, null, 2)
}
