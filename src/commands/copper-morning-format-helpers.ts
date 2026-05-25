import chalk from 'chalk'

import type { RayCondition, HearthCondition, CopperRay, CopperHearth, CopperMorningStats, CopperMorningResult } from './copper-morning-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 75) return chalk.rgb(205, 127, 50)(String(score))
  if (score >= 60) return chalk.rgb(218, 145, 60)(String(score))
  if (score >= 40) return chalk.rgb(170, 110, 50)(String(score))
  if (score >= 20) return chalk.rgb(140, 90, 40)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('copper-masterpiece') */
export function colorCondition(condition: RayCondition | string): string {
  switch (condition) {
    case 'copper-masterpiece':
      return chalk.rgb(184, 115, 51)('copper-masterpiece')
    case 'rose-gold-dawn':
      return chalk.rgb(205, 127, 50)('rose-gold-dawn')
    case 'proper-metal':
      return chalk.rgb(218, 145, 60)('proper-metal')
    case 'tarnished-bronze':
      return chalk.rgb(170, 110, 50)('tarnished-bronze')
    case 'rusted-iron':
      return chalk.rgb(140, 90, 40)('rusted-iron')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorHearthCondition('copper-temple') */
export function colorHearthCondition(condition: HearthCondition | string): string {
  switch (condition) {
    case 'copper-temple':
      return chalk.rgb(184, 115, 51)('copper-temple')
    case 'warm-forge':
      return chalk.rgb(205, 127, 50)('warm-forge')
    case 'proper-hearth':
      return chalk.rgb(218, 145, 60)('proper-hearth')
    case 'dying-ember':
      return chalk.rgb(170, 110, 50)('dying-ember')
    case 'cold-ash':
      return chalk.rgb(140, 90, 40)('cold-ash')
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

/** @example formatRayTable(ray) */
export function formatRayTable(ray: CopperRay): string {
  const lines: string[] = [
    chalk.bold(`Copper Ray: ${ray.file}`),
    '',
    `  Patina Wisdom:       ${colorScore(ray.patinaWisdom)}  ${chalk.dim(`(${ray.aging.patina})`)}`,
    `  Dawn Clarity:        ${colorScore(ray.dawnClarity)}  ${chalk.dim(`(${ray.kindling.dawn})`)}`,
    `  Conductivity:        ${colorScore(ray.conductivityQuality)}  ${chalk.dim(`(${ray.connecting.wire})`)}`,
    `  Warmth Resilience:   ${colorScore(ray.warmthResilience)}  ${chalk.dim(`(${ray.comforting.warmth})`)}`,
    `  Forge Strength:      ${colorScore(ray.forgeStrength)}  ${chalk.dim(`(${ray.grounding.forge})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${colorCondition(ray.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: CopperRay[]): string {
  if (rays.length === 0) return chalk.dim('No copper rays found')

  const colWidths = {
    file: Math.max(4, ...rays.map((r) => r.file.length)),
    wis: Math.max(4, ...rays.map((r) => String(r.patinaWisdom).length)),
    clar: Math.max(4, ...rays.map((r) => String(r.dawnClarity).length)),
    cond: Math.max(5, ...rays.map((r) => String(r.conductivityQuality).length)),
    warm: Math.max(4, ...rays.map((r) => String(r.warmthResilience).length)),
    str: Math.max(3, ...rays.map((r) => String(r.forgeStrength).length)),
    score: Math.max(5, ...rays.map((r) => String(r.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Copper Rays'), '']

  const header =
    chalk.rgb(184, 115, 51)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Cond', colWidths.cond)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Warm', colWidths.warm)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(184, 115, 51)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const r of rays) {
    lines.push(
      padRight(r.file, colWidths.file) +
        '  ' +
        padLeft(String(r.patinaWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(r.dawnClarity), colWidths.clar) +
        '  ' +
        padLeft(String(r.conductivityQuality), colWidths.cond) +
        '  ' +
        padLeft(String(r.warmthResilience), colWidths.warm) +
        '  ' +
        padLeft(String(r.forgeStrength), colWidths.str) +
        '  ' +
        padLeft(String(r.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatHearthTable(hearth) */
export function formatHearthTable(hearth: CopperHearth): string {
  const lines: string[] = [
    chalk.bold(`Copper Hearth: ${hearth.directory}`),
    '',
    `  Rays:                  ${hearth.rays.length}`,
    `  Avg Wisdom:            ${colorScore(hearth.avgWisdom)}`,
    `  Avg Conductivity:      ${colorScore(hearth.avgConductivity)}`,
    `  Avg Strength:          ${colorScore(hearth.avgStrength)}`,
    `  Copper Masterpieces:   ${hearth.copperMasterpieceCount}`,
    `  Hearth Type:           ${hearth.hearthType}`,
    `  Condition:             ${colorHearthCondition(hearth.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatHearthsTable(hearths) */
export function formatHearthsTable(hearths: CopperHearth[]): string {
  if (hearths.length === 0) return chalk.dim('No copper hearths found')

  const lines: string[] = [chalk.bold('Copper Hearths'), '']

  for (const h of hearths) {
    lines.push(
      `  ${chalk.rgb(184, 115, 51)(h.directory)}  ${colorScore(h.avgWisdom)}  ${colorHearthCondition(h.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperMorningStats): string {
  const lines: string[] = [
    chalk.bold('Copper Morning Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Hearths:         ${stats.totalHearths}`,
    `  Avg Patina Wisdom:     ${colorScore(stats.avgPatinaWisdom)}`,
    `  Avg Dawn Clarity:      ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Conductivity:      ${colorScore(stats.avgConductivityQuality)}`,
    `  Avg Warmth Resilience: ${colorScore(stats.avgWarmthResilience)}`,
    `  Avg Forge Strength:    ${colorScore(stats.avgForgeStrength)}`,
    `  Copper Masterpieces:   ${stats.copperMasterpieceCount}`,
    `  Rose Gold Dawns:       ${stats.roseGoldDawnCount}`,
    `  Proper Metals:         ${stats.properMetalCount}`,
    `  Tarnished Bronzes:     ${stats.tarnishedBronzeCount}`,
    `  Rusted Irons:          ${stats.rustedIronCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Warmth:        ${colorScore(stats.overallWarmth)}`,
    `  Smith Grade:           ${stats.smithGrade}`,
    `  Best Ray:              ${stats.bestRay || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Connected:        ${stats.mostConnected || 'N/A'}`,
    `  Warmest:               ${stats.warmest || 'N/A'}`,
    `  Strongest:             ${stats.strongest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(184, 115, 51)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CopperMorningResult): string {
  const lines: string[] = [
    chalk.bold('Copper Morning Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatHearthsTable(result.hearths),
    '',
    chalk.bold('Morning Overview'),
    '',
    `  Avg Wisdom:       ${colorScore(result.morning.avgWisdom)}`,
    `  Avg Conductivity: ${colorScore(result.morning.avgConductivity)}`,
    `  Avg Strength:     ${colorScore(result.morning.avgStrength)}`,
    `  Overall Warmth:   ${colorScore(result.morning.overallWarmth)}`,
    `  Is Copper:        ${result.morning.isCopper ? chalk.rgb(184, 115, 51)('yes') : chalk.gray('no')}`,
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
