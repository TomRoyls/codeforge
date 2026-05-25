import chalk from 'chalk'

import type { IngotCondition, ForgeCondition, CopperIngot, CopperForge, CopperMorningResult } from './copper-daybreak-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(218, 165, 32)(String(score))
  if (score >= 75) return chalk.rgb(205, 133, 63)(String(score))
  if (score >= 60) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 40) return chalk.rgb(150, 100, 50)(String(score))
  if (score >= 20) return chalk.rgb(119, 90, 60)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('copper-masterpiece') */
export function colorCondition(condition: IngotCondition | string): string {
  switch (condition) {
    case 'copper-masterpiece':
      return chalk.rgb(218, 165, 32)('copper-masterpiece')
    case 'golden-morning':
      return chalk.rgb(205, 133, 63)('golden-morning')
    case 'proper-alloy':
      return chalk.rgb(184, 115, 51)('proper-alloy')
    case 'tarnished-bronze':
      return chalk.rgb(150, 100, 50)('tarnished-bronze')
    case 'raw-ore':
      return chalk.rgb(119, 90, 60)('raw-ore')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorForgeCondition('master-forge') */
export function colorForgeCondition(condition: ForgeCondition | string): string {
  switch (condition) {
    case 'master-forge':
      return chalk.rgb(218, 165, 32)('master-forge')
    case 'smith-hall':
      return chalk.rgb(205, 133, 63)('smith-hall')
    case 'proper-workshop':
      return chalk.rgb(184, 115, 51)('proper-workshop')
    case 'rusty-shed':
      return chalk.rgb(150, 100, 50)('rusty-shed')
    case 'abandoned-mine':
      return chalk.rgb(119, 90, 60)('abandoned-mine')
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
export function formatIngotTable(ingot: CopperIngot): string {
  const lines: string[] = [
    chalk.bold(`Copper Ingot: ${ingot.file}`),
    '',
    `  Patina Wisdom:        ${colorScore(ingot.patinaWisdom)}  ${chalk.dim(`(${ingot.aging.patina})`)}`,
    `  Dawn Clarity:         ${colorScore(ingot.dawnClarity)}  ${chalk.dim(`(${ingot.illuminating.dawn})`)}`,
    `  Conductivity Quality: ${colorScore(ingot.conductivityQuality)}  ${chalk.dim(`(${ingot.conducting.conductor})`)}`,
    `  Warmth Resilience:    ${colorScore(ingot.warmthResilience)}  ${chalk.dim(`(${ingot.radiating.warmth})`)}`,
    `  Forge Strength:       ${colorScore(ingot.forgeStrength)}  ${chalk.dim(`(${ingot.hammering.forge})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${colorCondition(ingot.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: CopperIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No copper ingots found')

  const colWidths = {
    file: Math.max(4, ...ingots.map((i) => i.file.length)),
    pat: Math.max(3, ...ingots.map((i) => String(i.patinaWisdom).length)),
    dawn: Math.max(3, ...ingots.map((i) => String(i.dawnClarity).length)),
    cond: Math.max(3, ...ingots.map((i) => String(i.conductivityQuality).length)),
    warm: Math.max(3, ...ingots.map((i) => String(i.warmthResilience).length)),
    str: Math.max(3, ...ingots.map((i) => String(i.forgeStrength).length)),
    score: Math.max(5, ...ingots.map((i) => String(i.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Copper Ingots'), '']

  const header =
    chalk.rgb(218, 165, 32)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Pat', colWidths.pat)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Dawn', colWidths.dawn)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Cond', colWidths.cond)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Warm', colWidths.warm)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const i of ingots) {
    lines.push(
      padRight(i.file, colWidths.file) +
        '  ' +
        padLeft(String(i.patinaWisdom), colWidths.pat) +
        '  ' +
        padLeft(String(i.dawnClarity), colWidths.dawn) +
        '  ' +
        padLeft(String(i.conductivityQuality), colWidths.cond) +
        '  ' +
        padLeft(String(i.warmthResilience), colWidths.warm) +
        '  ' +
        padLeft(String(i.forgeStrength), colWidths.str) +
        '  ' +
        padLeft(String(i.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatForgeTable(forge) */
export function formatForgeTable(forge: CopperForge): string {
  const lines: string[] = [
    chalk.bold(`Copper Forge: ${forge.directory}`),
    '',
    `  Ingots:              ${forge.ingots.length}`,
    `  Avg Wisdom:          ${colorScore(forge.avgWisdom)}`,
    `  Avg Strength:        ${colorScore(forge.avgStrength)}`,
    `  Avg Clarity:         ${colorScore(forge.avgClarity)}`,
    `  Copper Masterpieces: ${forge.copperMasterpieceCount}`,
    `  Forge Type:          ${forge.forgeType}`,
    `  Condition:           ${colorForgeCondition(forge.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatForgesTable(forges) */
export function formatForgesTable(forges: CopperForge[]): string {
  if (forges.length === 0) return chalk.dim('No copper forges found')

  const lines: string[] = [chalk.bold('Copper Forges'), '']

  for (const f of forges) {
    lines.push(
      `  ${chalk.rgb(218, 165, 32)(f.directory)}  ${colorScore(f.avgWisdom)}  ${colorForgeCondition(f.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperMorningResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Copper Daybreak Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Forges:            ${stats.totalForges}`,
    `  Avg Patina Wisdom:       ${colorScore(stats.avgPatinaWisdom)}`,
    `  Avg Dawn Clarity:        ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Conductivity:        ${colorScore(stats.avgConductivityQuality)}`,
    `  Avg Warmth Resilience:   ${colorScore(stats.avgWarmthResilience)}`,
    `  Avg Forge Strength:      ${colorScore(stats.avgForgeStrength)}`,
    `  Copper Masterpieces:     ${stats.copperMasterpieceCount}`,
    `  Golden Mornings:         ${stats.goldenMorningCount}`,
    `  Proper Alloys:           ${stats.properAlloyCount}`,
    `  Tarnished Bronzes:       ${stats.tarnishedBronzeCount}`,
    `  Raw Ores:                ${stats.rawOreCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Luminosity:      ${colorScore(stats.overallLuminosity)}`,
    `  Smith Grade:             ${stats.smithGrade}`,
    `  Best Ingot:              ${stats.bestIngot || 'N/A'}`,
    `  Wisest:                  ${stats.wisest || 'N/A'}`,
    `  Clearest:                ${stats.clearest || 'N/A'}`,
    `  Most Conductive:         ${stats.mostConductive || 'N/A'}`,
    `  Warmest:                 ${stats.warmest || 'N/A'}`,
    `  Strongest:               ${stats.strongest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(218, 165, 32)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CopperMorningResult): string {
  const lines: string[] = [
    chalk.bold('Copper Daybreak Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatForgesTable(result.forges),
    '',
    chalk.bold('Metallurgy Overview'),
    '',
    `  Avg Wisdom:       ${colorScore(result.metallurgy.avgWisdom)}`,
    `  Avg Strength:     ${colorScore(result.metallurgy.avgStrength)}`,
    `  Avg Clarity:      ${colorScore(result.metallurgy.avgClarity)}`,
    `  Overall Luminosity: ${colorScore(result.metallurgy.overallLuminosity)}`,
    `  Is Copper:        ${result.metallurgy.isCopper ? chalk.rgb(218, 165, 32)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CopperMorningResult): string {
  return JSON.stringify(result, null, 2)
}
