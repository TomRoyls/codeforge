import chalk from 'chalk'

import type { FortressCondition, FortressType, IronBastionResult, IronFortress, IronPlate, PlateCondition, SmithGrade } from './iron-bastion-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 190, 200)(String(score))
  if (score >= 75) return chalk.rgb(160, 170, 180)(String(score))
  if (score >= 60) return chalk.rgb(140, 150, 160)(String(score))
  if (score >= 40) return chalk.rgb(120, 130, 140)(String(score))
  if (score >= 20) return chalk.rgb(100, 110, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPlateCondition('iron-masterpiece') */
export function colorPlateCondition(condition: PlateCondition | string): string {
  switch (condition) {
    case 'iron-masterpiece': return chalk.rgb(180, 190, 200)('iron-masterpiece')
    case 'tempered-steel': return chalk.rgb(160, 170, 180)('tempered-steel')
    case 'proper-iron': return chalk.rgb(140, 150, 160)('proper-iron')
    case 'rusted-metal': return chalk.rgb(120, 130, 140)('rusted-metal')
    case 'scrap-iron': return chalk.rgb(100, 110, 120)('scrap-iron')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorFortressType('impregnable-fortress') */
export function colorFortressType(type: FortressType | string): string {
  switch (type) {
    case 'impregnable-fortress': return chalk.rgb(180, 190, 200)('impregnable-fortress')
    case 'strong-castle': return chalk.rgb(160, 170, 180)('strong-castle')
    case 'proper-keep': return chalk.rgb(140, 150, 160)('proper-keep')
    case 'wooden-fort': return chalk.rgb(120, 130, 140)('wooden-fort')
    case 'ruin': return chalk.rgb(100, 110, 120)('ruin')
    case 'no-fortress': return chalk.gray('no-fortress')
    default: return chalk.gray(String(type))
  }
}

/** @example colorFortressCondition('iron-palace') */
export function colorFortressCondition(condition: FortressCondition | string): string {
  switch (condition) {
    case 'iron-palace': return chalk.rgb(180, 190, 200)('iron-palace')
    case 'steel-tower': return chalk.rgb(160, 170, 180)('steel-tower')
    case 'proper-fortress': return chalk.rgb(140, 150, 160)('proper-fortress')
    case 'stone-walls': return chalk.rgb(120, 130, 140)('stone-walls')
    case 'wooden-fence': return chalk.rgb(100, 110, 120)('wooden-fence')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorSmithGrade('master-smith') */
export function colorSmithGrade(grade: SmithGrade | string): string {
  switch (grade) {
    case 'master-smith': return chalk.rgb(180, 190, 200)('master-smith')
    case 'veteran-forge-worker': return chalk.rgb(160, 170, 180)('veteran-forge-worker')
    case 'proper-blacksmith': return chalk.rgb(140, 150, 160)('proper-blacksmith')
    case 'apprentice': return chalk.rgb(120, 130, 140)('apprentice')
    case 'novice': return chalk.rgb(100, 110, 120)('novice')
    case 'bellows-puller': return chalk.gray('bellows-puller')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPlateTable(plate) */
export function formatPlateTable(plate: IronPlate): string {
  const lines: string[] = [
    chalk.bold(`Iron Plate: ${plate.file}`),
    '',
    `  Structural Fortitude:  ${colorScore(plate.structuralFortitude)}  ${chalk.dim(`(${plate.reinforcing.beam})`)}`,
    `  Rust Resistance:       ${colorScore(plate.rustResistance)}  ${chalk.dim(`(${plate.protecting.coating})`)}`,
    `  Anvil Precision:       ${colorScore(plate.anvilPrecision)}  ${chalk.dim(`(${plate.hammering.craft})`)}`,
    `  Forge Vitality:        ${colorScore(plate.forgeVitality)}  ${chalk.dim(`(${plate.tempering.heat})`)}`,
    `  Steel Wisdom:          ${colorScore(plate.steelWisdom)}  ${chalk.dim(`(${plate.knowing.forge})`)}`,
    '',
    `  Quality Score: ${colorScore(plate.qualityScore)}  ${chalk.dim(`(${plate.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPlatesTable(plates) */
export function formatPlatesTable(plates: IronPlate[]): string {
  if (plates.length === 0) return chalk.dim('No iron plates found')
  const lines: string[] = [chalk.bold('Iron Plates'), '']
  for (const p of plates) {
    lines.push(`  ${chalk.rgb(180, 190, 200)(p.file)}  Fort:${colorScore(p.structuralFortitude)}  Rust:${colorScore(p.rustResistance)}  Score:${colorScore(p.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatFortressTable(fortress) */
export function formatFortressTable(fortress: IronFortress): string {
  const lines: string[] = [
    chalk.bold(`Iron Fortress: ${fortress.directory}`),
    '',
    `  Plates:           ${fortress.plates.length}`,
    `  Avg Fortitude:    ${colorScore(fortress.avgFortitude)}`,
    `  Avg Precision:    ${colorScore(fortress.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(fortress.avgWisdom)}`,
    `  Masterpieces:     ${fortress.ironMasterpieceCount}`,
    `  Type:             ${colorFortressType(fortress.fortressType)}`,
    `  Condition:        ${colorFortressCondition(fortress.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatFortressesTable(fortresses) */
export function formatFortressesTable(fortresses: IronFortress[]): string {
  if (fortresses.length === 0) return chalk.dim('No iron fortresses found')
  const lines: string[] = [chalk.bold('Iron Fortresses'), '']
  for (const f of fortresses) {
    lines.push(`  ${chalk.rgb(180, 190, 200)(f.directory)}  ${colorScore(f.avgFortitude)}  ${colorFortressCondition(f.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: IronBastionResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Iron Bastion Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Fortresses:          ${stats.totalFortresses}`,
    `  Avg Structural Fortitude:  ${colorScore(stats.avgStructuralFortitude)}`,
    `  Avg Rust Resistance:       ${colorScore(stats.avgRustResistance)}`,
    `  Avg Anvil Precision:       ${colorScore(stats.avgAnvilPrecision)}`,
    `  Avg Forge Vitality:        ${colorScore(stats.avgForgeVitality)}`,
    `  Avg Steel Wisdom:          ${colorScore(stats.avgSteelWisdom)}`,
    `  Iron Masterpieces:         ${stats.ironMasterpieceCount}`,
    `  Tempered Steel:            ${stats.temperedSteelCount}`,
    `  Proper Iron:               ${stats.properIronCount}`,
    `  Rusted Metal:              ${stats.rustedMetalCount}`,
    `  Scrap Iron:                ${stats.scrapIronCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Strength:          ${colorScore(stats.overallStrength)}`,
    `  Smith Grade:               ${colorSmithGrade(stats.smithGrade)}`,
    `  Best Plate:                ${stats.bestPlate || 'N/A'}`,
    `  Strongest:                 ${stats.strongest || 'N/A'}`,
    `  Most Resistant:            ${stats.mostResistant || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Most Vital:                ${stats.mostVital || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(180, 190, 200)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: IronBastionResult): string {
  const lines: string[] = [
    chalk.bold('Iron Bastion Analysis'),
    '',
    formatPlatesTable(result.plates),
    '',
    formatFortressesTable(result.fortresses),
    '',
    chalk.bold('Foundry Overview'),
    '',
    `  Avg Fortitude:    ${colorScore(result.foundry.avgFortitude)}`,
    `  Avg Precision:    ${colorScore(result.foundry.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.foundry.avgWisdom)}`,
    `  Overall Strength: ${colorScore(result.foundry.overallStrength)}`,
    `  Is Iron:          ${result.foundry.isIron ? chalk.rgb(180, 190, 200)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: IronBastionResult): string {
  return JSON.stringify(result, null, 2)
}
