import chalk from 'chalk'

import type { AlloyCondition, CommanderGrade, StationCondition, StationType, TitaniumAlloy, TitaniumFrontierResult, TitaniumStation } from './titanium-edge-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(135, 155, 175)(String(score))
  if (score >= 75) return chalk.rgb(160, 170, 185)(String(score))
  if (score >= 60) return chalk.rgb(130, 140, 155)(String(score))
  if (score >= 40) return chalk.rgb(110, 115, 130)(String(score))
  if (score >= 20) return chalk.rgb(90, 95, 105)(String(score))
  return chalk.gray(String(score))
}

/** @example colorAlloyCondition('titanium-masterpiece') */
export function colorAlloyCondition(condition: AlloyCondition | string): string {
  switch (condition) {
    case 'titanium-masterpiece': return chalk.rgb(135, 155, 175)('titanium-masterpiece')
    case 'aerospace-grade': return chalk.rgb(160, 170, 185)('aerospace-grade')
    case 'proper-alloy': return chalk.rgb(130, 140, 155)('proper-alloy')
    case 'base-metal': return chalk.rgb(110, 115, 130)('base-metal')
    case 'scrap-titanium': return chalk.rgb(90, 95, 105)('scrap-titanium')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorStationType('space-station') */
export function colorStationType(type: StationType | string): string {
  switch (type) {
    case 'space-station': return chalk.rgb(135, 155, 175)('space-station')
    case 'orbital-lab': return chalk.rgb(160, 170, 185)('orbital-lab')
    case 'proper-habitat': return chalk.rgb(130, 140, 155)('proper-habitat')
    case 'launch-pad': return chalk.rgb(110, 115, 130)('launch-pad')
    case 'empty-silo': return chalk.rgb(90, 95, 105)('empty-silo')
    case 'no-station': return chalk.gray('no-station')
    default: return chalk.gray(String(type))
  }
}

/** @example colorStationCondition('titanium-palace') */
export function colorStationCondition(condition: StationCondition | string): string {
  switch (condition) {
    case 'titanium-palace': return chalk.rgb(135, 155, 175)('titanium-palace')
    case 'space-fortress': return chalk.rgb(160, 170, 185)('space-fortress')
    case 'proper-station': return chalk.rgb(130, 140, 155)('proper-station')
    case 'metal-shed': return chalk.rgb(110, 115, 130)('metal-shed')
    case 'cardboard-box': return chalk.rgb(90, 95, 105)('cardboard-box')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCommanderGrade('mission-commander') */
export function colorCommanderGrade(grade: CommanderGrade | string): string {
  switch (grade) {
    case 'mission-commander': return chalk.rgb(135, 155, 175)('mission-commander')
    case 'veteran-pilot': return chalk.rgb(160, 170, 185)('veteran-pilot')
    case 'proper-officer': return chalk.rgb(130, 140, 155)('proper-officer')
    case 'cadet': return chalk.rgb(110, 115, 130)('cadet')
    case 'recruit': return chalk.rgb(90, 95, 105)('recruit')
    case 'ground-crew': return chalk.gray('ground-crew')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatAlloyTable(alloy) */
export function formatAlloyTable(alloy: TitaniumAlloy): string {
  const lines: string[] = [
    chalk.bold(`Titanium Alloy: ${alloy.file}`),
    '',
    `  Alloy Strength:        ${colorScore(alloy.alloyStrength)}  ${chalk.dim(`(${alloy.strengthening.grade})`)}`,
    `  Frontier Vision:       ${colorScore(alloy.frontierVision)}  ${chalk.dim(`(${alloy.exploring.horizon})`)}`,
    `  Corrosion Resistance:  ${colorScore(alloy.corrosionResistance)}  ${chalk.dim(`(${alloy.resisting.shield})`)}`,
    `  Weight Efficiency:     ${colorScore(alloy.weightEfficiency)}  ${chalk.dim(`(${alloy.optimizing.ratio})`)}`,
    `  Space Wisdom:          ${colorScore(alloy.spaceWisdom)}  ${chalk.dim(`(${alloy.navigating.orbit})`)}`,
    '',
    `  Quality Score: ${colorScore(alloy.qualityScore)}  ${chalk.dim(`(${alloy.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatAlloysTable(alloys) */
export function formatAlloysTable(alloys: TitaniumAlloy[]): string {
  if (alloys.length === 0) return chalk.dim('No titanium alloys found')
  const lines: string[] = [chalk.bold('Titanium Alloys'), '']
  for (const a of alloys) {
    lines.push(`  ${chalk.rgb(135, 155, 175)(a.file)}  Str:${colorScore(a.alloyStrength)}  Vis:${colorScore(a.frontierVision)}  Score:${colorScore(a.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatStationTable(station) */
export function formatStationTable(station: TitaniumStation): string {
  const lines: string[] = [
    chalk.bold(`Titanium Station: ${station.directory}`),
    '',
    `  Alloys:            ${station.alloys.length}`,
    `  Avg Strength:      ${colorScore(station.avgStrength)}`,
    `  Avg Efficiency:    ${colorScore(station.avgEfficiency)}`,
    `  Avg Wisdom:        ${colorScore(station.avgWisdom)}`,
    `  Masterpieces:      ${station.titaniumMasterpieceCount}`,
    `  Station Type:      ${colorStationType(station.stationType)}`,
    `  Condition:         ${colorStationCondition(station.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatStationsTable(stations) */
export function formatStationsTable(stations: TitaniumStation[]): string {
  if (stations.length === 0) return chalk.dim('No titanium stations found')
  const lines: string[] = [chalk.bold('Titanium Stations'), '']
  for (const s of stations) {
    lines.push(`  ${chalk.rgb(135, 155, 175)(s.directory)}  ${colorScore(s.avgStrength)}  ${colorStationCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TitaniumFrontierResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Titanium Frontier Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Stations:           ${stats.totalStations}`,
    `  Avg Alloy Strength:       ${colorScore(stats.avgAlloyStrength)}`,
    `  Avg Frontier Vision:      ${colorScore(stats.avgFrontierVision)}`,
    `  Avg Corrosion Resistance: ${colorScore(stats.avgCorrosionResistance)}`,
    `  Avg Weight Efficiency:    ${colorScore(stats.avgWeightEfficiency)}`,
    `  Avg Space Wisdom:         ${colorScore(stats.avgSpaceWisdom)}`,
    `  Titanium Masterpieces:    ${stats.titaniumMasterpieceCount}`,
    `  Aerospace Grade:          ${stats.aerospaceGradeCount}`,
    `  Proper Alloy:             ${stats.properAlloyCount}`,
    `  Base Metal:               ${stats.baseMetalCount}`,
    `  Scrap Titanium:           ${stats.scrapTitaniumCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Readiness:        ${colorScore(stats.overallReadiness)}`,
    `  Commander Grade:          ${colorCommanderGrade(stats.commanderGrade)}`,
    `  Best Alloy:               ${stats.bestAlloy || 'N/A'}`,
    `  Strongest:                ${stats.strongest || 'N/A'}`,
    `  Most Visionary:           ${stats.mostVisionary || 'N/A'}`,
    `  Most Resistant:           ${stats.mostResistant || 'N/A'}`,
    `  Most Efficient:           ${stats.mostEfficient || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(135, 155, 175)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TitaniumFrontierResult): string {
  const lines: string[] = [
    chalk.bold('Titanium Frontier Analysis'),
    '',
    formatAlloysTable(result.alloys),
    '',
    formatStationsTable(result.stations),
    '',
    chalk.bold('Mission Overview'),
    '',
    `  Avg Strength:       ${colorScore(result.mission.avgStrength)}`,
    `  Avg Efficiency:     ${colorScore(result.mission.avgEfficiency)}`,
    `  Avg Wisdom:         ${colorScore(result.mission.avgWisdom)}`,
    `  Overall Readiness:  ${colorScore(result.mission.overallReadiness)}`,
    `  Is Titanium:        ${result.mission.isTitanium ? chalk.rgb(135, 155, 175)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TitaniumFrontierResult): string {
  return JSON.stringify(result, null, 2)
}
