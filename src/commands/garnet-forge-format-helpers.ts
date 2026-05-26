import chalk from 'chalk'

import type { CrucibleCondition, CrucibleType, GarnetCondition, GarnetForgeResult, GarnetIngot, GarnetCrucible, SmithGrade } from './garnet-forge-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(178, 34, 34)(String(score))
  if (score >= 75) return chalk.rgb(160, 30, 30)(String(score))
  if (score >= 60) return chalk.rgb(140, 28, 28)(String(score))
  if (score >= 40) return chalk.rgb(120, 24, 24)(String(score))
  if (score >= 20) return chalk.rgb(100, 20, 20)(String(score))
  return chalk.gray(String(score))
}

/** @example colorGarnetCondition('garnet-masterpiece') */
export function colorGarnetCondition(condition: GarnetCondition | string): string {
  switch (condition) {
    case 'garnet-masterpiece': return chalk.rgb(178, 34, 34)('garnet-masterpiece')
    case 'crimson-gem': return chalk.rgb(160, 30, 30)('crimson-gem')
    case 'proper-garnet': return chalk.rgb(140, 28, 28)('proper-garnet')
    case 'rough-stone': return chalk.rgb(120, 24, 24)('rough-stone')
    case 'raw-ore': return chalk.rgb(100, 20, 20)('raw-ore')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCrucibleType('grand-forge') */
export function colorCrucibleType(type: CrucibleType | string): string {
  switch (type) {
    case 'grand-forge': return chalk.rgb(178, 34, 34)('grand-forge')
    case 'blast-furnace': return chalk.rgb(160, 30, 30)('blast-furnace')
    case 'proper-crucible': return chalk.rgb(140, 28, 28)('proper-crucible')
    case 'campfire': return chalk.rgb(120, 24, 24)('campfire')
    case 'cold-hearth': return chalk.rgb(100, 20, 20)('cold-hearth')
    case 'no-crucible': return chalk.gray('no-crucible')
    default: return chalk.gray(String(type))
  }
}

/** @example colorCrucibleCondition('garnet-palace') */
export function colorCrucibleCondition(condition: CrucibleCondition | string): string {
  switch (condition) {
    case 'garnet-palace': return chalk.rgb(178, 34, 34)('garnet-palace')
    case 'crimson-forge': return chalk.rgb(160, 30, 30)('crimson-forge')
    case 'proper-foundry': return chalk.rgb(140, 28, 28)('proper-foundry')
    case 'stone-kiln': return chalk.rgb(120, 24, 24)('stone-kiln')
    case 'empty-hearth': return chalk.rgb(100, 20, 20)('empty-hearth')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorSmithGrade('forge-master') */
export function colorSmithGrade(grade: SmithGrade | string): string {
  switch (grade) {
    case 'forge-master': return chalk.rgb(178, 34, 34)('forge-master')
    case 'veteran-smith': return chalk.rgb(160, 30, 30)('veteran-smith')
    case 'proper-forge-worker': return chalk.rgb(140, 28, 28)('proper-forge-worker')
    case 'apprentice': return chalk.rgb(120, 24, 24)('apprentice')
    case 'novice': return chalk.rgb(100, 20, 20)('novice')
    case 'bellows-boy': return chalk.gray('bellows-boy')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatIngotTable(ingot) */
export function formatIngotTable(ingot: GarnetIngot): string {
  const lines: string[] = [
    chalk.bold(`Garnet Ingot: ${ingot.file}`),
    '',
    `  Crimson Endurance: ${colorScore(ingot.crimsonEndurance)}  ${chalk.dim(`(${ingot.enduring.stone})`)}`,
    `  Flame Mastery:     ${colorScore(ingot.flameMastery)}  ${chalk.dim(`(${ingot.transforming.flame})`)}`,
    `  Ember Precision:   ${colorScore(ingot.emberPrecision)}  ${chalk.dim(`(${ingot.focusing.heat})`)}`,
    `  Heat Resilience:   ${colorScore(ingot.heatResilience)}  ${chalk.dim(`(${ingot.surviving.shield})`)}`,
    `  Forge Wisdom:      ${colorScore(ingot.forgeWisdom)}  ${chalk.dim(`(${ingot.understanding.craft})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${ingot.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: GarnetIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No garnet ingots found')
  const lines: string[] = [chalk.bold('Garnet Ingots'), '']
  for (const i of ingots) {
    lines.push(`  ${chalk.rgb(178, 34, 34)(i.file)}  End:${colorScore(i.crimsonEndurance)}  Mas:${colorScore(i.flameMastery)}  Score:${colorScore(i.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatCrucibleTable(crucible) */
export function formatCrucibleTable(crucible: GarnetCrucible): string {
  const lines: string[] = [
    chalk.bold(`Garnet Crucible: ${crucible.directory}`),
    '',
    `  Ingots:           ${crucible.ingots.length}`,
    `  Avg Endurance:    ${colorScore(crucible.avgEndurance)}`,
    `  Avg Precision:    ${colorScore(crucible.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(crucible.avgWisdom)}`,
    `  Masterpieces:     ${crucible.garnetMasterpieceCount}`,
    `  Type:             ${colorCrucibleType(crucible.crucibleType)}`,
    `  Condition:        ${colorCrucibleCondition(crucible.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCruciblesTable(crucibles) */
export function formatCruciblesTable(crucibles: GarnetCrucible[]): string {
  if (crucibles.length === 0) return chalk.dim('No garnet crucibles found')
  const lines: string[] = [chalk.bold('Garnet Crucibles'), '']
  for (const c of crucibles) {
    lines.push(`  ${chalk.rgb(178, 34, 34)(c.directory)}  ${colorScore(c.avgEndurance)}  ${colorCrucibleCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: GarnetForgeResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Garnet Forge Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Crucibles:        ${stats.totalCrucibles}`,
    `  Avg Crimson Endurance:  ${colorScore(stats.avgCrimsonEndurance)}`,
    `  Avg Flame Mastery:      ${colorScore(stats.avgFlameMastery)}`,
    `  Avg Ember Precision:    ${colorScore(stats.avgEmberPrecision)}`,
    `  Avg Heat Resilience:    ${colorScore(stats.avgHeatResilience)}`,
    `  Avg Forge Wisdom:       ${colorScore(stats.avgForgeWisdom)}`,
    `  Garnet Masterpieces:    ${stats.garnetMasterpieceCount}`,
    `  Crimson Gems:           ${stats.crimsonGemCount}`,
    `  Proper Garnet:          ${stats.properGarnetCount}`,
    `  Rough Stone:            ${stats.roughStoneCount}`,
    `  Raw Ore:                ${stats.rawOreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Temper:         ${colorScore(stats.overallTemper)}`,
    `  Smith Grade:            ${colorSmithGrade(stats.smithGrade)}`,
    `  Best Ingot:             ${stats.bestIngot || 'N/A'}`,
    `  Most Enduring:          ${stats.mostEnduring || 'N/A'}`,
    `  Most Masterful:         ${stats.mostMasterful || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(178, 34, 34)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: GarnetForgeResult): string {
  const lines: string[] = [
    chalk.bold('Garnet Forge Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatCruciblesTable(result.crucibles),
    '',
    chalk.bold('Furnace Overview'),
    '',
    `  Avg Endurance:    ${colorScore(result.furnace.avgEndurance)}`,
    `  Avg Precision:    ${colorScore(result.furnace.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.furnace.avgWisdom)}`,
    `  Overall Temper:   ${colorScore(result.furnace.overallTemper)}`,
    `  Is Garnet:        ${result.furnace.isGarnet ? chalk.rgb(178, 34, 34)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: GarnetForgeResult): string {
  return JSON.stringify(result, null, 2)
}
