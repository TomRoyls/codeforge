import chalk from 'chalk'

import type { CommanderGrade, CrystalSentinelResult, CrystalTower, CrystalWatch, TowerCondition, TowerType, WatchCondition } from './crystal-sentinel-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(130, 200, 255)(String(score))
  if (score >= 75) return chalk.rgb(110, 180, 240)(String(score))
  if (score >= 60) return chalk.rgb(90, 160, 220)(String(score))
  if (score >= 40) return chalk.rgb(70, 130, 190)(String(score))
  if (score >= 20) return chalk.rgb(50, 100, 160)(String(score))
  return chalk.gray(String(score))
}

/** @example colorWatchCondition('crystal-masterpiece') */
export function colorWatchCondition(condition: WatchCondition | string): string {
  switch (condition) {
    case 'crystal-masterpiece': return chalk.rgb(130, 200, 255)('crystal-masterpiece')
    case 'gem-sentinel': return chalk.rgb(110, 180, 240)('gem-sentinel')
    case 'proper-crystal': return chalk.rgb(90, 160, 220)('proper-crystal')
    case 'flawed-quartz': return chalk.rgb(70, 130, 190)('flawed-quartz')
    case 'gravel-stone': return chalk.rgb(50, 100, 160)('gravel-stone')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorTowerType('grand-watchtower') */
export function colorTowerType(type: TowerType | string): string {
  switch (type) {
    case 'grand-watchtower': return chalk.rgb(130, 200, 255)('grand-watchtower')
    case 'crystal-spire': return chalk.rgb(110, 180, 240)('crystal-spire')
    case 'proper-tower': return chalk.rgb(90, 160, 220)('proper-tower')
    case 'wooden-post': return chalk.rgb(70, 130, 190)('wooden-post')
    case 'empty-platform': return chalk.rgb(50, 100, 160)('empty-platform')
    case 'no-tower': return chalk.gray('no-tower')
    default: return chalk.gray(String(type))
  }
}

/** @example colorTowerCondition('crystal-palace') */
export function colorTowerCondition(condition: TowerCondition | string): string {
  switch (condition) {
    case 'crystal-palace': return chalk.rgb(130, 200, 255)('crystal-palace')
    case 'gem-fortress': return chalk.rgb(110, 180, 240)('gem-fortress')
    case 'proper-tower': return chalk.rgb(90, 160, 220)('proper-tower')
    case 'stone-wall': return chalk.rgb(70, 130, 190)('stone-wall')
    case 'wooden-fence': return chalk.rgb(50, 100, 160)('wooden-fence')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCommanderGrade('crystal-commander') */
export function colorCommanderGrade(grade: CommanderGrade | string): string {
  switch (grade) {
    case 'crystal-commander': return chalk.rgb(130, 200, 255)('crystal-commander')
    case 'senior-sentinel': return chalk.rgb(110, 180, 240)('senior-sentinel')
    case 'proper-guard': return chalk.rgb(90, 160, 220)('proper-guard')
    case 'watchman': return chalk.rgb(70, 130, 190)('watchman')
    case 'recruit': return chalk.rgb(50, 100, 160)('recruit')
    case 'sleeper': return chalk.gray('sleeper')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatWatchTable(watch) */
export function formatWatchTable(watch: CrystalWatch): string {
  const lines: string[] = [
    chalk.bold(`Crystal Watch: ${watch.file}`),
    '',
    `  Crystalline Vigilance:   ${colorScore(watch.crystallineVigilance)}  ${chalk.dim(`(${watch.watching.guard})`)}`,
    `  Facet Sharpness:         ${colorScore(watch.facetSharpness)}  ${chalk.dim(`(${watch.cutting.blade})`)}`,
    `  Prism Clarity:           ${colorScore(watch.prismClarity)}  ${chalk.dim(`(${watch.revealing.transparency})`)}`,
    `  Structure Endurance:     ${colorScore(watch.structureEndurance)}  ${chalk.dim(`(${watch.standing.crystal})`)}`,
    `  Mineral Guardianship:    ${colorScore(watch.mineralGuardianship)}  ${chalk.dim(`(${watch.guarding.shield})`)}`,
    '',
    `  Quality Score: ${colorScore(watch.qualityScore)}  ${chalk.dim(`(${watch.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatWatchesTable(watches) */
export function formatWatchesTable(watches: CrystalWatch[]): string {
  if (watches.length === 0) return chalk.dim('No crystal watches found')
  const lines: string[] = [chalk.bold('Crystal Watches'), '']
  for (const w of watches) {
    lines.push(`  ${chalk.rgb(130, 200, 255)(w.file)}  Vig:${colorScore(w.crystallineVigilance)}  Sharp:${colorScore(w.facetSharpness)}  Score:${colorScore(w.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatTowerTable(tower) */
export function formatTowerTable(tower: CrystalTower): string {
  const lines: string[] = [
    chalk.bold(`Crystal Tower: ${tower.directory}`),
    '',
    `  Watches:           ${tower.watches.length}`,
    `  Avg Vigilance:     ${colorScore(tower.avgVigilance)}`,
    `  Avg Sharpness:     ${colorScore(tower.avgSharpness)}`,
    `  Avg Guardianship:  ${colorScore(tower.avgGuardianship)}`,
    `  Masterpieces:      ${tower.crystalMasterpieceCount}`,
    `  Type:              ${colorTowerType(tower.towerType)}`,
    `  Condition:         ${colorTowerCondition(tower.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatTowersTable(towers) */
export function formatTowersTable(towers: CrystalTower[]): string {
  if (towers.length === 0) return chalk.dim('No crystal towers found')
  const lines: string[] = [chalk.bold('Crystal Towers'), '']
  for (const t of towers) {
    lines.push(`  ${chalk.rgb(130, 200, 255)(t.directory)}  ${colorScore(t.avgVigilance)}  ${colorTowerCondition(t.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CrystalSentinelResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Crystal Sentinel Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Towers:               ${stats.totalTowers}`,
    `  Avg Crystalline Vigilance:  ${colorScore(stats.avgCrystallineVigilance)}`,
    `  Avg Facet Sharpness:        ${colorScore(stats.avgFacetSharpness)}`,
    `  Avg Prism Clarity:          ${colorScore(stats.avgPrismClarity)}`,
    `  Avg Structure Endurance:    ${colorScore(stats.avgStructureEndurance)}`,
    `  Avg Mineral Guardianship:   ${colorScore(stats.avgMineralGuardianship)}`,
    `  Crystal Masterpieces:       ${stats.crystalMasterpieceCount}`,
    `  Gem Sentinels:              ${stats.gemSentinelCount}`,
    `  Proper Crystals:            ${stats.properCrystalCount}`,
    `  Flawed Quartz:              ${stats.flawedQuartzCount}`,
    `  Gravel Stone:               ${stats.gravelStoneCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  Overall Vigilance:          ${colorScore(stats.overallVigilance)}`,
    `  Commander Grade:            ${colorCommanderGrade(stats.commanderGrade)}`,
    `  Best Watch:                 ${stats.bestWatch || 'N/A'}`,
    `  Most Vigilant:              ${stats.mostVigilant || 'N/A'}`,
    `  Sharpest:                   ${stats.sharpest || 'N/A'}`,
    `  Clearest:                   ${stats.clearest || 'N/A'}`,
    `  Most Enduring:              ${stats.mostEnduring || 'N/A'}`,
    `  Most Protective:            ${stats.mostProtective || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(130, 200, 255)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CrystalSentinelResult): string {
  const lines: string[] = [
    chalk.bold('Crystal Sentinel Analysis'),
    '',
    formatWatchesTable(result.watches),
    '',
    formatTowersTable(result.towers),
    '',
    chalk.bold('Garrison Overview'),
    '',
    `  Avg Vigilance:     ${colorScore(result.garrison.avgVigilance)}`,
    `  Avg Sharpness:     ${colorScore(result.garrison.avgSharpness)}`,
    `  Avg Guardianship:  ${colorScore(result.garrison.avgGuardianship)}`,
    `  Overall Vigilance: ${colorScore(result.garrison.overallVigilance)}`,
    `  Is Crystal:        ${result.garrison.isCrystal ? chalk.rgb(130, 200, 255)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CrystalSentinelResult): string {
  return JSON.stringify(result, null, 2)
}
