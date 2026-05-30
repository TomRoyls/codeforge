import chalk from 'chalk'

import type { VolumeCondition, PageCondition, DiamondPage, DiamondVolume, DiamondAtlasStats, DiamondAtlasResult } from './diamond-atlas-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(185, 242, 255)(String(score))
  if (score >= 75) return chalk.rgb(173, 216, 230)(String(score))
  if (score >= 60) return chalk.cyan(String(score))
  if (score >= 40) return chalk.rgb(135, 206, 235)(String(score))
  if (score >= 20) return chalk.blue(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('diamond-masterpiece') */
export function colorCondition(condition: PageCondition | string): string {
  switch (condition) {
    case 'diamond-masterpiece':
      return chalk.rgb(185, 242, 255)('diamond-masterpiece')
    case 'crystal-atlas':
      return chalk.rgb(173, 216, 230)('crystal-atlas')
    case 'proper-map':
      return chalk.cyan('proper-map')
    case 'faded-chart':
      return chalk.rgb(135, 206, 235)('faded-chart')
    case 'torn-page':
      return chalk.blue('torn-page')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorVolumeCondition('crystal-library') */
export function colorVolumeCondition(condition: VolumeCondition | string): string {
  switch (condition) {
    case 'crystal-library':
      return chalk.rgb(185, 242, 255)('crystal-library')
    case 'diamond-archive':
      return chalk.rgb(173, 216, 230)('diamond-archive')
    case 'proper-collection':
      return chalk.cyan('proper-collection')
    case 'faded-shelf':
      return chalk.rgb(135, 206, 235)('faded-shelf')
    case 'torn-book':
      return chalk.blue('torn-book')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPageTable(page) */
export function formatPageTable(page: DiamondPage): string {
  const lines: string[] = [
    chalk.bold(`Diamond Page: ${page.file}`),
    '',
    `  Hardness Clarity:    ${colorScore(page.hardnessClarity)}  ${chalk.dim(`(${page.crystallizing.diamond})`)}`,
    `  Cut Precision:      ${colorScore(page.cutPrecision)}  ${chalk.dim(`(${page.faceting.cut})`)}`,
    `  Map Completeness:   ${colorScore(page.mapCompleteness)}  ${chalk.dim(`(${page.mapping.coverage})`)}`,
    `  Fire Dispersion:    ${colorScore(page.fireDispersion)}  ${chalk.dim(`(${page.dispersing.spectrum})`)}`,
    `  Cartographic Wisdom:${colorScore(page.cartographicWisdom)}  ${chalk.dim(`(${page.guiding.compass})`)}`,
    '',
    `  Quality Score: ${colorScore(page.qualityScore)}  ${chalk.dim(`(${colorCondition(page.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPagesTable(pages) */
export function formatPagesTable(pages: DiamondPage[]): string {
  if (pages.length === 0) return chalk.dim('No diamond pages found')

  const colWidths = {
    file: Math.max(4, ...pages.map((p) => p.file.length)),
    clarity: Math.max(7, ...pages.map((p) => String(p.hardnessClarity).length)),
    precision: Math.max(9, ...pages.map((p) => String(p.cutPrecision).length)),
    complete: Math.max(9, ...pages.map((p) => String(p.mapCompleteness).length)),
    fire: Math.max(4, ...pages.map((p) => String(p.fireDispersion).length)),
    wisdom: Math.max(6, ...pages.map((p) => String(p.cartographicWisdom).length)),
    score: Math.max(5, ...pages.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Diamond Pages'), '']

  const header =
    chalk.rgb(185, 242, 255)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Clarity', colWidths.clarity)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Precision', colWidths.precision)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Complete', colWidths.complete)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Fire', colWidths.fire)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of pages) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.hardnessClarity), colWidths.clarity) +
        '  ' +
        padLeft(String(p.cutPrecision), colWidths.precision) +
        '  ' +
        padLeft(String(p.mapCompleteness), colWidths.complete) +
        '  ' +
        padLeft(String(p.fireDispersion), colWidths.fire) +
        '  ' +
        padLeft(String(p.cartographicWisdom), colWidths.wisdom) +
        '  ' +
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
    `  Pages:          ${volume.pages.length}`,
    `  Avg Clarity:    ${colorScore(volume.avgClarity)}`,
    `  Avg Precision:  ${colorScore(volume.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(volume.avgWisdom)}`,
    `  Masterpieces:   ${volume.diamondMasterpieceCount}`,
    `  Volume Type:    ${volume.volumeType}`,
    `  Condition:      ${colorVolumeCondition(volume.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatVolumesTable(volumes) */
export function formatVolumesTable(volumes: DiamondVolume[]): string {
  if (volumes.length === 0) return chalk.dim('No diamond volumes found')

  const lines: string[] = [chalk.bold('Diamond Volumes'), '']

  for (const v of volumes) {
    lines.push(
      `  ${chalk.rgb(185, 242, 255)(v.directory)}  ${colorScore(v.avgClarity)}  ${colorVolumeCondition(v.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: DiamondAtlasStats): string {
  const lines: string[] = [
    chalk.bold('Diamond Atlas Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Volumes:         ${stats.totalVolumes}`,
    `  Avg Hardness Clarity:  ${colorScore(stats.avgHardnessClarity)}`,
    `  Avg Cut Precision:     ${colorScore(stats.avgCutPrecision)}`,
    `  Avg Map Completeness:  ${colorScore(stats.avgMapCompleteness)}`,
    `  Avg Fire Dispersion:   ${colorScore(stats.avgFireDispersion)}`,
    `  Avg Cartographic Wisdom:${colorScore(stats.avgCartographicWisdom)}`,
    `  Diamond Masterpieces:  ${stats.diamondMasterpieceCount}`,
    `  Crystal Atlas:         ${stats.crystalAtlasCount}`,
    `  Proper Map:            ${stats.properMapCount}`,
    `  Faded Chart:           ${stats.fadedChartCount}`,
    `  Torn Page:             ${stats.tornPageCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Cartographer Grade:    ${stats.cartographerGrade}`,
    `  Best Page:             ${stats.bestPage || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Complete:         ${stats.mostComplete || 'N/A'}`,
    `  Most Colorful:         ${stats.mostColorful || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(185, 242, 255)('\u2022')} ${rec}`)
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
    `  Avg Clarity:       ${colorScore(result.cartography.avgClarity)}`,
    `  Avg Precision:     ${colorScore(result.cartography.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.cartography.avgWisdom)}`,
    `  Overall Brilliance:${colorScore(result.cartography.overallBrilliance)}`,
    `  Is Diamond:        ${result.cartography.isDiamond ? chalk.rgb(185, 242, 255)('yes') : chalk.gray('no')}`,
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
