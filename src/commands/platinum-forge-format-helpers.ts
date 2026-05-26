import chalk from 'chalk'

import type { FoundryCondition, PlatinumFoundry, PlatinumForgeResult, PlatinumIngot } from './platinum-forge-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(229, 228, 226)(String(score))
  if (score >= 75) return chalk.rgb(200, 200, 200)(String(score))
  if (score >= 60) return chalk.rgb(170, 170, 175)(String(score))
  if (score >= 40) return chalk.rgb(140, 140, 150)(String(score))
  if (score >= 20) return chalk.rgb(110, 110, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('platinum-palace') */
export function colorCondition(condition: FoundryCondition | string): string {
  switch (condition) {
    case 'platinum-palace': return chalk.rgb(229, 228, 226)('platinum-palace')
    case 'grand-forge': return chalk.rgb(200, 200, 200)('grand-forge')
    case 'proper-workshop': return chalk.rgb(170, 170, 175)('proper-workshop')
    case 'dusty-shed': return chalk.rgb(140, 140, 150)('dusty-shed')
    case 'empty-lot': return chalk.rgb(110, 110, 120)('empty-lot')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatIngotTable(ingot) */
export function formatIngotTable(ingot: PlatinumIngot): string {
  const lines: string[] = [
    chalk.bold(`Platinum Ingot: ${ingot.file}`),
    '',
    `  Noble Purity:       ${colorScore(ingot.noblePurity)}  ${chalk.dim(`(${ingot.refining.grade})`)}`,
    `  Forge Mastery:      ${colorScore(ingot.forgeMastery)}  ${chalk.dim(`(${ingot.smithing.skill})`)}`,
    `  Anvil Precision:    ${colorScore(ingot.anvilPrecision)}  ${chalk.dim(`(${ingot.shaping.cut})`)}`,
    `  Hammer Resilience:  ${colorScore(ingot.hammerResilience)}  ${chalk.dim(`(${ingot.tempering.temper})`)}`,
    `  Crucible Wisdom:    ${colorScore(ingot.crucibleWisdom)}  ${chalk.dim(`(${ingot.testing.trial})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${ingot.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: PlatinumIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No platinum ingots found')
  const lines: string[] = [chalk.bold('Platinum Ingots'), '']
  for (const ing of ingots) {
    lines.push(`  ${chalk.rgb(229, 228, 226)(ing.file)}  Purity:${colorScore(ing.noblePurity)}  Mastery:${colorScore(ing.forgeMastery)}  Score:${colorScore(ing.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatFoundryTable(foundry) */
export function formatFoundryTable(foundry: PlatinumFoundry): string {
  const lines: string[] = [
    chalk.bold(`Platinum Foundry: ${foundry.directory}`),
    '',
    `  Ingots:              ${foundry.ingots.length}`,
    `  Avg Purity:          ${colorScore(foundry.avgPurity)}`,
    `  Avg Mastery:         ${colorScore(foundry.avgMastery)}`,
    `  Avg Wisdom:          ${colorScore(foundry.avgWisdom)}`,
    `  Masterpieces:        ${foundry.platinumMasterpieceCount}`,
    `  Foundry Type:        ${foundry.foundryType}`,
    `  Condition:           ${colorCondition(foundry.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatFoundriesTable(foundries) */
export function formatFoundriesTable(foundries: PlatinumFoundry[]): string {
  if (foundries.length === 0) return chalk.dim('No platinum foundries found')
  const lines: string[] = [chalk.bold('Platinum Foundries'), '']
  for (const f of foundries) {
    lines.push(`  ${chalk.rgb(229, 228, 226)(f.directory)}  ${colorScore(f.avgPurity)}  ${colorCondition(f.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PlatinumForgeResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Platinum Forge Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Foundries:        ${stats.totalFoundries}`,
    `  Avg Noble Purity:       ${colorScore(stats.avgNoblePurity)}`,
    `  Avg Forge Mastery:      ${colorScore(stats.avgForgeMastery)}`,
    `  Avg Anvil Precision:    ${colorScore(stats.avgAnvilPrecision)}`,
    `  Avg Hammer Resilience:  ${colorScore(stats.avgHammerResilience)}`,
    `  Avg Crucible Wisdom:    ${colorScore(stats.avgCrucibleWisdom)}`,
    `  Platinum Masterpieces:  ${stats.platinumMasterpieceCount}`,
    `  Refined Ingots:         ${stats.refinedIngotCount}`,
    `  Proper Metal:           ${stats.properMetalCount}`,
    `  Base Alloy:             ${stats.baseAlloyCount}`,
    `  Raw Ore:                ${stats.rawOreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Refinement:     ${colorScore(stats.overallRefinement)}`,
    `  Smith Grade:            ${stats.smithGrade}`,
    `  Best Ingot:             ${stats.bestIngot || 'N/A'}`,
    `  Purest:                 ${stats.purest || 'N/A'}`,
    `  Most Masterful:         ${stats.mostMasterful || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Toughest:               ${stats.toughest || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(229, 228, 226)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PlatinumForgeResult): string {
  const lines: string[] = [
    chalk.bold('Platinum Forge Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatFoundriesTable(result.foundries),
    '',
    chalk.bold('Furnace Overview'),
    '',
    `  Avg Purity:            ${colorScore(result.furnace.avgPurity)}`,
    `  Avg Mastery:           ${colorScore(result.furnace.avgMastery)}`,
    `  Avg Wisdom:            ${colorScore(result.furnace.avgWisdom)}`,
    `  Overall Refinement:    ${colorScore(result.furnace.overallRefinement)}`,
    `  Is Platinum:           ${result.furnace.isPlatinum ? chalk.rgb(229, 228, 226)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PlatinumForgeResult): string {
  return JSON.stringify(result, null, 2)
}
