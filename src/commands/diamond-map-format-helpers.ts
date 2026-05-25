import chalk from 'chalk'

import type { PageCondition, VolumeCondition, DiamondPage, DiamondMapResult, DiamondVolume } from './diamond-map-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(0, 191, 255)(String(score))
  if (score >= 75) return chalk.rgb(0, 160, 220)(String(score))
  if (score >= 60) return chalk.rgb(0, 130, 190)(String(score))
  if (score >= 40) return chalk.rgb(0, 100, 160)(String(score))
  if (score >= 20) return chalk.rgb(0, 70, 130)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPageCondition('diamond-masterpiece') */
export function colorPageCondition(condition: PageCondition | string): string {
  switch (condition) {
    case 'diamond-masterpiece':
      return chalk.rgb(0, 191, 255)('diamond-masterpiece')
    case 'flawless-map':
      return chalk.rgb(0, 160, 220)('flawless-map')
    case 'proper-gem':
      return chalk.rgb(0, 130, 190)('proper-gem')
    case 'included-stone':
      return chalk.rgb(0, 100, 160)('included-stone')
    case 'rough-rock':
      return chalk.rgb(0, 70, 130)('rough-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorVolumeCondition('diamond-library') */
export function colorVolumeCondition(condition: VolumeCondition | string): string {
  switch (condition) {
    case 'diamond-library':
      return chalk.rgb(0, 191, 255)('diamond-library')
    case 'gem-collection':
      return chalk.rgb(0, 160, 220)('gem-collection')
    case 'proper-bookshelf':
      return chalk.rgb(0, 130, 190)('proper-bookshelf')
    case 'pamphlet-rack':
      return chalk.rgb(0, 100, 160)('pamphlet-rack')
    case 'empty-shelf':
      return chalk.rgb(0, 70, 130)('empty-shelf')
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
    `  Quality Score: ${colorScore(page.qualityScore)}  ${chalk.dim(`(${colorPageCondition(page.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPagesTable(pages) */
export function formatPagesTable(pages: DiamondPage[]): string {
  if (pages.length === 0) return chalk.dim('No diamond pages found')

  const colWidths = {
    file: Math.max(4, ...pages.map((p) => p.file.length)),
    hrd: Math.max(4, ...pages.map((p) => String(p.hardnessClarity).length)),
    cut: Math.max(4, ...pages.map((p) => String(p.cutPrecision).length)),
    map: Math.max(4, ...pages.map((p) => String(p.mapCompleteness).length)),
    fir: Math.max(4, ...pages.map((p) => String(p.fireDispersion).length)),
    wis: Math.max(4, ...pages.map((p) => String(p.cartographicWisdom).length)),
    score: Math.max(5, ...pages.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Diamond Pages'), '']

  const header =
    chalk.rgb(0, 191, 255)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Hrd', colWidths.hrd)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Cut', colWidths.cut)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Map', colWidths.map)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Fir', colWidths.fir)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(0, 191, 255)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of pages) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.hardnessClarity), colWidths.hrd) +
        '  ' +
        padLeft(String(p.cutPrecision), colWidths.cut) +
        '  ' +
        padLeft(String(p.mapCompleteness), colWidths.map) +
        '  ' +
        padLeft(String(p.fireDispersion), colWidths.fir) +
        '  ' +
        padLeft(String(p.cartographicWisdom), colWidths.wis) +
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
    `  Pages:           ${volume.pages.length}`,
    `  Avg Hardness:    ${colorScore(volume.avgHardness)}`,
    `  Avg Precision:   ${colorScore(volume.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(volume.avgWisdom)}`,
    `  Masterpieces:    ${volume.diamondMasterpieceCount}`,
    `  Volume Type:     ${volume.volumeType}`,
    `  Condition:       ${colorVolumeCondition(volume.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatVolumesTable(volumes) */
export function formatVolumesTable(volumes: DiamondVolume[]): string {
  if (volumes.length === 0) return chalk.dim('No diamond volumes found')

  const lines: string[] = [chalk.bold('Diamond Volumes'), '']

  for (const v of volumes) {
    lines.push(
      `  ${chalk.rgb(0, 191, 255)(v.directory)}  ${colorScore(v.avgHardness)}  ${colorVolumeCondition(v.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: DiamondMapResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Diamond Map Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Volumes:         ${stats.totalVolumes}`,
    `  Avg Hardness Clarity:  ${colorScore(stats.avgHardnessClarity)}`,
    `  Avg Cut Precision:     ${colorScore(stats.avgCutPrecision)}`,
    `  Avg Map Completeness:  ${colorScore(stats.avgMapCompleteness)}`,
    `  Avg Fire Dispersion:   ${colorScore(stats.avgFireDispersion)}`,
    `  Avg Cartographic Wisdom:${colorScore(stats.avgCartographicWisdom)}`,
    `  Diamond Masterpieces:  ${stats.diamondMasterpieceCount}`,
    `  Flawless Map:          ${stats.flawlessMapCount}`,
    `  Proper Gem:            ${stats.properGemCount}`,
    `  Included Stone:        ${stats.includedStoneCount}`,
    `  Rough Rock:            ${stats.roughRockCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Cartographer Grade:    ${stats.cartographerGrade}`,
    `  Best Page:             ${stats.bestPage || 'N/A'}`,
    `  Hardest:               ${stats.hardest || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Complete:         ${stats.mostComplete || 'N/A'}`,
    `  Most Brilliant:        ${stats.mostBrilliant || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(0, 191, 255)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: DiamondMapResult): string {
  const lines: string[] = [
    chalk.bold('Diamond Map Analysis'),
    '',
    formatPagesTable(result.pages),
    '',
    formatVolumesTable(result.volumes),
    '',
    chalk.bold('Cartography Overview'),
    '',
    `  Avg Hardness:   ${colorScore(result.cartography.avgHardness)}`,
    `  Avg Precision:  ${colorScore(result.cartography.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.cartography.avgWisdom)}`,
    `  Brilliance:     ${colorScore(result.cartography.overallBrilliance)}`,
    `  Is Diamond:     ${result.cartography.isDiamond ? chalk.rgb(0, 191, 255)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: DiamondMapResult): string {
  return JSON.stringify(result, null, 2)
}
