import chalk from 'chalk'

import type { DiamondAtlasResult, DiamondPage, DiamondVolume, VolumeCondition } from './diamond-index-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 180, 220)(String(score))
  if (score >= 75) return chalk.rgb(80, 160, 200)(String(score))
  if (score >= 60) return chalk.rgb(60, 140, 180)(String(score))
  if (score >= 40) return chalk.rgb(80, 120, 140)(String(score))
  if (score >= 20) return chalk.rgb(60, 90, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorVolumeCondition('diamond-library') */
export function colorVolumeCondition(condition: VolumeCondition | string): string {
  switch (condition) {
    case 'diamond-library': return chalk.rgb(100, 180, 220)('diamond-library')
    case 'gem-collection': return chalk.rgb(80, 160, 200)('gem-collection')
    case 'proper-bookshelf': return chalk.rgb(60, 140, 180)('proper-bookshelf')
    case 'pamphlet-rack': return chalk.rgb(80, 120, 140)('pamphlet-rack')
    case 'empty-shelf': return chalk.rgb(60, 90, 110)('empty-shelf')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPageTable(page) */
export function formatPageTable(page: DiamondPage): string {
  const lines: string[] = [
    chalk.bold(`Diamond Page: ${page.file}`),
    '',
    `  Hardness Clarity:     ${colorScore(page.hardnessClarity)}  ${chalk.dim(`(${page.crystallizing.crystal})`)}`,
    `  Cut Precision:        ${colorScore(page.cutPrecision)}  ${chalk.dim(`(${page.cutting.cut})`)}`,
    `  Map Completeness:     ${colorScore(page.mapCompleteness)}  ${chalk.dim(`(${page.mapping.coverage})`)}`,
    `  Fire Dispersion:      ${colorScore(page.fireDispersion)}  ${chalk.dim(`(${page.dispersing.spectrum})`)}`,
    `  Cartographic Wisdom:  ${colorScore(page.cartographicWisdom)}  ${chalk.dim(`(${page.navigating.chart})`)}`,
    '',
    `  Quality Score: ${colorScore(page.qualityScore)}  ${chalk.dim(`(${page.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPagesTable(pages) */
export function formatPagesTable(pages: DiamondPage[]): string {
  if (pages.length === 0) return chalk.dim('No diamond pages found')
  const colWidths = {
    file: Math.max(4, ...pages.map((p) => p.file.length)),
    hardness: Math.max(8, ...pages.map((p) => String(p.hardnessClarity).length)),
    cut: Math.max(3, ...pages.map((p) => String(p.cutPrecision).length)),
    map: Math.max(3, ...pages.map((p) => String(p.mapCompleteness).length)),
    fire: Math.max(4, ...pages.map((p) => String(p.fireDispersion).length)),
    wisdom: Math.max(6, ...pages.map((p) => String(p.cartographicWisdom).length)),
    score: Math.max(5, ...pages.map((p) => String(p.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Diamond Pages'), '']
  const header =
    chalk.rgb(100, 180, 220)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Hardness', colWidths.hardness)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Cut', colWidths.cut)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Map', colWidths.map)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Fire', colWidths.fire)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(100, 180, 220)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const p of pages) {
    lines.push(
      padRight(p.file, colWidths.file) + '  ' +
      padLeft(String(p.hardnessClarity), colWidths.hardness) + '  ' +
      padLeft(String(p.cutPrecision), colWidths.cut) + '  ' +
      padLeft(String(p.mapCompleteness), colWidths.map) + '  ' +
      padLeft(String(p.fireDispersion), colWidths.fire) + '  ' +
      padLeft(String(p.cartographicWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(p.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatVolumeTable(volume) */
export function formatVolumeTable(volume: DiamondVolume): string {
  const lines: string[] = [
    chalk.bold(`Diamond Volume: ${volume.directory}`),
    '',
    `  Pages:            ${volume.pages.length}`,
    `  Avg Hardness:     ${colorScore(volume.avgHardness)}`,
    `  Avg Precision:    ${colorScore(volume.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(volume.avgWisdom)}`,
    `  Masterpieces:     ${volume.diamondMasterpieceCount}`,
    `  Volume Type:      ${volume.volumeType}`,
    `  Condition:        ${colorVolumeCondition(volume.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatVolumesTable(volumes) */
export function formatVolumesTable(volumes: DiamondVolume[]): string {
  if (volumes.length === 0) return chalk.dim('No diamond volumes found')
  const lines: string[] = [chalk.bold('Diamond Volumes'), '']
  for (const v of volumes) {
    lines.push(`  ${chalk.rgb(100, 180, 220)(v.directory)}  ${colorScore(v.avgHardness)}  ${colorVolumeCondition(v.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: DiamondAtlasResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Diamond Atlas Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Volumes:            ${stats.totalVolumes}`,
    `  Avg Hardness Clarity:     ${colorScore(stats.avgHardnessClarity)}`,
    `  Avg Cut Precision:        ${colorScore(stats.avgCutPrecision)}`,
    `  Avg Map Completeness:     ${colorScore(stats.avgMapCompleteness)}`,
    `  Avg Fire Dispersion:      ${colorScore(stats.avgFireDispersion)}`,
    `  Avg Cartographic Wisdom:  ${colorScore(stats.avgCartographicWisdom)}`,
    `  Diamond Masterpieces:     ${stats.diamondMasterpieceCount}`,
    `  Flawless Maps:            ${stats.flawlessMapCount}`,
    `  Proper Gems:              ${stats.properGemCount}`,
    `  Included Stones:          ${stats.includedStoneCount}`,
    `  Rough Rocks:              ${stats.roughRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Brilliance:       ${colorScore(stats.overallBrilliance)}`,
    `  Cartographer Grade:       ${stats.cartographerGrade}`,
    `  Best Page:                ${stats.bestPage || 'N/A'}`,
    `  Hardest:                  ${stats.hardest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Complete:            ${stats.mostComplete || 'N/A'}`,
    `  Most Brilliant:           ${stats.mostBrilliant || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(100, 180, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: DiamondAtlasResult): string {
  const lines: string[] = [
    chalk.bold('Diamond Atlas Analysis'),
    '',
    formatPagesTable(result.pages),
    '',
    formatVolumesTable(result.volumes),
    '',
    chalk.bold('Cartography Overview'),
    '',
    `  Avg Hardness:      ${colorScore(result.cartography.avgHardness)}`,
    `  Avg Precision:     ${colorScore(result.cartography.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.cartography.avgWisdom)}`,
    `  Overall Brilliance: ${colorScore(result.cartography.overallBrilliance)}`,
    `  Is Diamond:        ${result.cartography.isDiamond ? chalk.rgb(100, 180, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: DiamondAtlasResult): string {
  return JSON.stringify(result, null, 2)
}
