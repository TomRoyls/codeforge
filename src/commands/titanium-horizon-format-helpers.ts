import chalk from 'chalk'

import type { PlateCondition, StationCondition, TitaniumPlate, TitaniumStation, TitaniumHorizonResult } from './titanium-horizon-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(176, 196, 222)(String(score))
  if (score >= 75) return chalk.rgb(135, 160, 200)(String(score))
  if (score >= 60) return chalk.rgb(100, 130, 180)(String(score))
  if (score >= 40) return chalk.rgb(80, 110, 160)(String(score))
  if (score >= 20) return chalk.rgb(100, 120, 150)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('titanium-masterpiece') */
export function colorCondition(condition: PlateCondition | string): string {
  switch (condition) {
    case 'titanium-masterpiece':
      return chalk.rgb(176, 196, 222)('titanium-masterpiece')
    case 'space-grade':
      return chalk.rgb(135, 160, 200)('space-grade')
    case 'proper-alloy':
      return chalk.rgb(100, 130, 180)('proper-alloy')
    case 'base-metal':
      return chalk.rgb(80, 110, 160)('base-metal')
    case 'raw-ore':
      return chalk.rgb(100, 120, 150)('raw-ore')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorStationCondition('starship-hull') */
export function colorStationCondition(condition: StationCondition | string): string {
  switch (condition) {
    case 'starship-hull':
      return chalk.rgb(176, 196, 222)('starship-hull')
    case 'space-station':
      return chalk.rgb(135, 160, 200)('space-station')
    case 'proper-habitat':
      return chalk.rgb(100, 130, 180)('proper-habitat')
    case 'metal-shed':
      return chalk.rgb(80, 110, 160)('metal-shed')
    case 'dirt-floor':
      return chalk.rgb(100, 120, 150)('dirt-floor')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPlateTable(plate) */
export function formatPlateTable(plate: TitaniumPlate): string {
  const lines: string[] = [
    chalk.bold(`Titanium Plate: ${plate.file}`),
    '',
    `  Alloy Strength:        ${colorScore(plate.alloyStrength)}  ${chalk.dim(`(${plate.alloying.alloy})`)}`,
    `  Frontier Vision:       ${colorScore(plate.frontierVision)}  ${chalk.dim(`(${plate.exploring.frontier})`)}`,
    `  Corrosion Resistance:  ${colorScore(plate.corrosionResistance)}  ${chalk.dim(`(${plate.resisting.shield})`)}`,
    `  Weight Efficiency:     ${colorScore(plate.weightEfficiency)}  ${chalk.dim(`(${plate.optimizing.ratio})`)}`,
    `  Space Wisdom:          ${colorScore(plate.spaceWisdom)}  ${chalk.dim(`(${plate.navigating.navigation})`)}`,
    '',
    `  Quality Score: ${colorScore(plate.qualityScore)}  ${chalk.dim(`(${colorCondition(plate.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPlatesTable(plates) */
export function formatPlatesTable(plates: TitaniumPlate[]): string {
  if (plates.length === 0) return chalk.dim('No titanium plates found')

  const colWidths = {
    file: Math.max(4, ...plates.map((p) => p.file.length)),
    str: Math.max(3, ...plates.map((p) => String(p.alloyStrength).length)),
    vis: Math.max(3, ...plates.map((p) => String(p.frontierVision).length)),
    res: Math.max(3, ...plates.map((p) => String(p.corrosionResistance).length)),
    eff: Math.max(3, ...plates.map((p) => String(p.weightEfficiency).length)),
    wis: Math.max(3, ...plates.map((p) => String(p.spaceWisdom).length)),
    score: Math.max(5, ...plates.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Titanium Plates'), '']

  const header =
    chalk.rgb(176, 196, 222)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Vis', colWidths.vis)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Eff', colWidths.eff)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(176, 196, 222)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of plates) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.alloyStrength), colWidths.str) +
        '  ' +
        padLeft(String(p.frontierVision), colWidths.vis) +
        '  ' +
        padLeft(String(p.corrosionResistance), colWidths.res) +
        '  ' +
        padLeft(String(p.weightEfficiency), colWidths.eff) +
        '  ' +
        padLeft(String(p.spaceWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatStationTable(station) */
export function formatStationTable(station: TitaniumStation): string {
  const lines: string[] = [
    chalk.bold(`Titanium Station: ${station.directory}`),
    '',
    `  Plates:          ${station.plates.length}`,
    `  Avg Strength:    ${colorScore(station.avgStrength)}`,
    `  Avg Vision:      ${colorScore(station.avgVision)}`,
    `  Avg Wisdom:      ${colorScore(station.avgWisdom)}`,
    `  Masterpieces:    ${station.titaniumMasterpieceCount}`,
    `  Station Type:    ${station.stationType}`,
    `  Condition:       ${colorStationCondition(station.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatStationsTable(stations) */
export function formatStationsTable(stations: TitaniumStation[]): string {
  if (stations.length === 0) return chalk.dim('No titanium stations found')

  const lines: string[] = [chalk.bold('Titanium Stations'), '']

  for (const s of stations) {
    lines.push(
      `  ${chalk.rgb(176, 196, 222)(s.directory)}  ${colorScore(s.avgStrength)}  ${colorStationCondition(s.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TitaniumHorizonResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Titanium Horizon Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Stations:         ${stats.totalStations}`,
    `  Avg Alloy Strength:     ${colorScore(stats.avgAlloyStrength)}`,
    `  Avg Frontier Vision:    ${colorScore(stats.avgFrontierVision)}`,
    `  Avg Corrosion Resist:   ${colorScore(stats.avgCorrosionResistance)}`,
    `  Avg Weight Efficiency:  ${colorScore(stats.avgWeightEfficiency)}`,
    `  Avg Space Wisdom:       ${colorScore(stats.avgSpaceWisdom)}`,
    `  Titanium Masterpieces:  ${stats.titaniumMasterpieceCount}`,
    `  Space Grade:            ${stats.spaceGradeCount}`,
    `  Proper Alloy:           ${stats.properAlloyCount}`,
    `  Base Metal:             ${stats.baseMetalCount}`,
    `  Raw Ore:                ${stats.rawOreCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Advancement:    ${colorScore(stats.overallAdvancement)}`,
    `  Engineer Grade:         ${stats.engineerGrade}`,
    `  Best Plate:             ${stats.bestPlate || 'N/A'}`,
    `  Strongest:              ${stats.strongest || 'N/A'}`,
    `  Most Visionary:         ${stats.mostVisionary || 'N/A'}`,
    `  Most Resistant:         ${stats.mostResistant || 'N/A'}`,
    `  Most Efficient:         ${stats.mostEfficient || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(176, 196, 222)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TitaniumHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Titanium Horizon Analysis'),
    '',
    formatPlatesTable(result.plates),
    '',
    formatStationsTable(result.stations),
    '',
    chalk.bold('Mission Overview'),
    '',
    `  Avg Strength:     ${colorScore(result.mission.avgStrength)}`,
    `  Avg Vision:       ${colorScore(result.mission.avgVision)}`,
    `  Avg Wisdom:       ${colorScore(result.mission.avgWisdom)}`,
    `  Advancement:      ${colorScore(result.mission.overallAdvancement)}`,
    `  Is Titanium:      ${result.mission.isTitanium ? chalk.rgb(176, 196, 222)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TitaniumHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
