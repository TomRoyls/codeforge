import chalk from 'chalk'

import type { CopperFoundry, CopperMorningResult, CopperRay, FoundryCondition } from './copper-sunrise-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(210, 140, 80)(String(score))
  if (score >= 75) return chalk.rgb(190, 120, 60)(String(score))
  if (score >= 60) return chalk.rgb(170, 100, 50)(String(score))
  if (score >= 40) return chalk.rgb(140, 80, 40)(String(score))
  if (score >= 20) return chalk.rgb(110, 60, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorFoundryCondition('copper-hall') */
export function colorFoundryCondition(condition: FoundryCondition | string): string {
  switch (condition) {
    case 'copper-hall': return chalk.rgb(210, 140, 80)('copper-hall')
    case 'warm-workshop': return chalk.rgb(190, 120, 60)('warm-workshop')
    case 'proper-forge': return chalk.rgb(170, 100, 50)('proper-forge')
    case 'cold-shed': return chalk.rgb(140, 80, 40)('cold-shed')
    case 'ruins': return chalk.rgb(110, 60, 30)('ruins')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatRayTable(ray) */
export function formatRayTable(ray: CopperRay): string {
  const lines: string[] = [
    chalk.bold(`Copper Ray: ${ray.file}`),
    '',
    `  Warmth Radiance:   ${colorScore(ray.warmthRadiance)}  ${chalk.dim(`(${ray.radiating.radiance})`)}`,
    `  Dawn Patience:     ${colorScore(ray.dawnPatience)}  ${chalk.dim(`(${ray.unfolding.dawn})`)}`,
    `  Conductive Flow:   ${colorScore(ray.conductiveFlow)}  ${chalk.dim(`(${ray.conducting.conductor})`)}`,
    `  Forge Clarity:     ${colorScore(ray.forgeClarity)}  ${chalk.dim(`(${ray.illuminating.forge})`)}`,
    `  Aged Wisdom:       ${colorScore(ray.agedWisdom)}  ${chalk.dim(`(${ray.accumulating.patina})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${ray.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: CopperRay[]): string {
  if (rays.length === 0) return chalk.dim('No copper rays found')
  const colWidths = {
    file: Math.max(4, ...rays.map((r) => r.file.length)),
    warmth: Math.max(7, ...rays.map((r) => String(r.warmthRadiance).length)),
    patience: Math.max(8, ...rays.map((r) => String(r.dawnPatience).length)),
    flow: Math.max(4, ...rays.map((r) => String(r.conductiveFlow).length)),
    clarity: Math.max(7, ...rays.map((r) => String(r.forgeClarity).length)),
    wisdom: Math.max(6, ...rays.map((r) => String(r.agedWisdom).length)),
    score: Math.max(5, ...rays.map((r) => String(r.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Copper Rays'), '']
  const header =
    chalk.rgb(210, 140, 80)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Warmth', colWidths.warmth)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Patience', colWidths.patience)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Flow', colWidths.flow)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(210, 140, 80)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const r of rays) {
    lines.push(
      padRight(r.file, colWidths.file) + '  ' +
      padLeft(String(r.warmthRadiance), colWidths.warmth) + '  ' +
      padLeft(String(r.dawnPatience), colWidths.patience) + '  ' +
      padLeft(String(r.conductiveFlow), colWidths.flow) + '  ' +
      padLeft(String(r.forgeClarity), colWidths.clarity)) + '  ' +
      padLeft(String(r.agedWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(r.qualityScore), colWidths.score)
  }
  return lines.join('\n')
}

/** @example formatFoundryTable(foundry) */
export function formatFoundryTable(foundry: CopperFoundry): string {
  const lines: string[] = [
    chalk.bold(`Copper Foundry: ${foundry.directory}`),
    '',
    `  Rays:            ${foundry.rays.length}`,
    `  Avg Warmth:      ${colorScore(foundry.avgWarmth)}`,
    `  Avg Flow:        ${colorScore(foundry.avgFlow)}`,
    `  Avg Wisdom:      ${colorScore(foundry.avgWisdom)}`,
    `  Masterpieces:    ${foundry.copperMasterpieceCount}`,
    `  Foundry Type:    ${foundry.foundryType}`,
    `  Condition:       ${colorFoundryCondition(foundry.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatFoundriesTable(foundries) */
export function formatFoundriesTable(foundries: CopperFoundry[]): string {
  if (foundries.length === 0) return chalk.dim('No copper foundries found')
  const lines: string[] = [chalk.bold('Copper Foundries'), '']
  for (const f of foundries) {
    lines.push(`  ${chalk.rgb(210, 140, 80)(f.directory)}  ${colorScore(f.avgWarmth)}  ${colorFoundryCondition(f.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperMorningResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Copper Morning Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Foundries:        ${stats.totalFoundries}`,
    `  Avg Warmth Radiance:    ${colorScore(stats.avgWarmthRadiance)}`,
    `  Avg Dawn Patience:      ${colorScore(stats.avgDawnPatience)}`,
    `  Avg Conductive Flow:    ${colorScore(stats.avgConductiveFlow)}`,
    `  Avg Forge Clarity:      ${colorScore(stats.avgForgeClarity)}`,
    `  Avg Aged Wisdom:        ${colorScore(stats.avgAgedWisdom)}`,
    `  Copper Masterpieces:    ${stats.copperMasterpieceCount}`,
    `  Golden Mornings:        ${stats.goldenMorningCount}`,
    `  Proper Alloys:          ${stats.properAlloyCount}`,
    `  Tarnished Metals:       ${stats.tarnishedMetalCount}`,
    `  Raw Ores:               ${stats.rawOreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Radiance:       ${colorScore(stats.overallRadiance)}`,
    `  Smith Grade:            ${stats.smithGrade}`,
    `  Best Ray:               ${stats.bestRay || 'N/A'}`,
    `  Warmest:                ${stats.warmest || 'N/A'}`,
    `  Most Patient:           ${stats.mostPatient || 'N/A'}`,
    `  Most Conductive:        ${stats.mostConductive || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(210, 140, 80)('\u2022')} ${rec}`)
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
    formatFoundriesTable(result.foundries),
    '',
    chalk.bold('Dawn Overview'),
    '',
    `  Avg Warmth:        ${colorScore(result.dawn.avgWarmth)}`,
    `  Avg Flow:          ${colorScore(result.dawn.avgFlow)}`,
    `  Avg Wisdom:        ${colorScore(result.dawn.avgWisdom)}`,
    `  Overall Radiance:  ${colorScore(result.dawn.overallRadiance)}`,
    `  Is Copper:         ${result.dawn.isCopper ? chalk.rgb(210, 140, 80)('yes') : chalk.gray('no')}`,
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
