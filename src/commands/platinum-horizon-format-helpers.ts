import chalk from 'chalk'

import type { TowerCondition, RayCondition, PlatinumRay, PlatinumTower, PlatinumHorizonStats, PlatinumHorizonResult } from './platinum-horizon-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 200, 220)(String(score))
  if (score >= 75) return chalk.rgb(180, 180, 200)(String(score))
  if (score >= 60) return chalk.rgb(160, 160, 180)(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('platinum-masterpiece') */
export function colorCondition(condition: RayCondition | string): string {
  switch (condition) {
    case 'platinum-masterpiece':
      return chalk.rgb(200, 200, 220)('platinum-masterpiece')
    case 'noble-horizon':
      return chalk.rgb(180, 180, 200)('noble-horizon')
    case 'proper-vista':
      return chalk.rgb(160, 160, 180)('proper-vista')
    case 'faded-skyline':
      return chalk.yellow('faded-skyline')
    case 'dark-valley':
      return chalk.rgb(255, 165, 0)('dark-valley')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorTowerCondition('platinum-palace') */
export function colorTowerCondition(condition: TowerCondition | string): string {
  switch (condition) {
    case 'platinum-palace':
      return chalk.rgb(200, 200, 220)('platinum-palace')
    case 'noble-fortress':
      return chalk.rgb(180, 180, 200)('noble-fortress')
    case 'proper-watchtower':
      return chalk.rgb(160, 160, 180)('proper-watchtower')
    case 'faded-tower':
      return chalk.yellow('faded-tower')
    case 'dark-valley':
      return chalk.rgb(255, 165, 0)('dark-valley')
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

/** @example formatRayTable(ray) */
export function formatRayTable(ray: PlatinumRay): string {
  const lines: string[] = [
    chalk.bold(`Platinum Ray: ${ray.file}`),
    '',
    `  Royal Purity:       ${colorScore(ray.royalPurity)}  ${chalk.dim(`(${ray.shining.metal})`)}`,
    `  Horizon Vision:     ${colorScore(ray.horizonVision)}  ${chalk.dim(`(${ray.envisioning.horizon})`)}`,
    `  Platinum Resilience:${colorScore(ray.platinumResilience)}  ${chalk.dim(`(${ray.enduring.shield})`)}`,
    `  Crest Authority:    ${colorScore(ray.crestAuthority)}  ${chalk.dim(`(${ray.commanding.crest})`)}`,
    `  Future Wisdom:      ${colorScore(ray.futureWisdom)}  ${chalk.dim(`(${ray.preparing.oracle})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${colorCondition(ray.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: PlatinumRay[]): string {
  if (rays.length === 0) return chalk.dim('No platinum rays found')

  const colWidths = {
    file: Math.max(4, ...rays.map((r) => r.file.length)),
    purity: Math.max(6, ...rays.map((r) => String(r.royalPurity).length)),
    vision: Math.max(6, ...rays.map((r) => String(r.horizonVision).length)),
    resilience: Math.max(10, ...rays.map((r) => String(r.platinumResilience).length)),
    authority: Math.max(9, ...rays.map((r) => String(r.crestAuthority).length)),
    wisdom: Math.max(7, ...rays.map((r) => String(r.futureWisdom).length)),
    score: Math.max(5, ...rays.map((r) => String(r.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Platinum Rays'), '']

  const header =
    chalk.rgb(200, 200, 220)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Purity', colWidths.purity)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Vision', colWidths.vision)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Authority', colWidths.authority)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(200, 200, 220)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const r of rays) {
    lines.push(
      padRight(r.file, colWidths.file) +
        '  ' +
        padLeft(String(r.royalPurity), colWidths.purity) +
        '  ' +
        padLeft(String(r.horizonVision), colWidths.vision) +
        '  ' +
        padLeft(String(r.platinumResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(r.crestAuthority), colWidths.authority) +
        '  ' +
        padLeft(String(r.futureWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(r.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatTowerTable(tower) */
export function formatTowerTable(tower: PlatinumTower): string {
  const lines: string[] = [
    chalk.bold(`Platinum Tower: ${tower.directory}`),
    '',
    `  Rays:         ${tower.rays.length}`,
    `  Avg Purity:   ${colorScore(tower.avgPurity)}`,
    `  Avg Vision:   ${colorScore(tower.avgVision)}`,
    `  Avg Wisdom:   ${colorScore(tower.avgWisdom)}`,
    `  Masterpieces: ${tower.platinumMasterpieceCount}`,
    `  Tower Type:   ${tower.towerType}`,
    `  Condition:    ${colorTowerCondition(tower.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatTowersTable(towers) */
export function formatTowersTable(towers: PlatinumTower[]): string {
  if (towers.length === 0) return chalk.dim('No platinum towers found')

  const lines: string[] = [chalk.bold('Platinum Towers'), '']

  for (const t of towers) {
    lines.push(
      `  ${chalk.rgb(200, 200, 220)(t.directory)}  ${colorScore(t.avgPurity)}  ${colorTowerCondition(t.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PlatinumHorizonStats): string {
  const lines: string[] = [
    chalk.bold('Platinum Horizon Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Towers:          ${stats.totalTowers}`,
    `  Avg Royal Purity:      ${colorScore(stats.avgRoyalPurity)}`,
    `  Avg Horizon Vision:    ${colorScore(stats.avgHorizonVision)}`,
    `  Avg Platinum Resilience:${colorScore(stats.avgPlatinumResilience)}`,
    `  Avg Crest Authority:   ${colorScore(stats.avgCrestAuthority)}`,
    `  Avg Future Wisdom:     ${colorScore(stats.avgFutureWisdom)}`,
    `  Platinum Masterpieces: ${stats.platinumMasterpieceCount}`,
    `  Noble Horizons:        ${stats.nobleHorizonCount}`,
    `  Proper Vistas:         ${stats.properVistaCount}`,
    `  Faded Skylines:        ${stats.fadedSkylineCount}`,
    `  Dark Valleys:          ${stats.darkValleyCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Architect Grade:       ${stats.architectGrade}`,
    `  Best Ray:              ${stats.bestRay || 'N/A'}`,
    `  Purest:                ${stats.purest || 'N/A'}`,
    `  Most Visionary:        ${stats.mostVisionary || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Most Authoritative:    ${stats.mostAuthoritative || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(200, 200, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PlatinumHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Platinum Horizon Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatTowersTable(result.towers),
    '',
    chalk.bold('Skyline Overview'),
    '',
    `  Avg Purity:        ${colorScore(result.skyline.avgPurity)}`,
    `  Avg Vision:        ${colorScore(result.skyline.avgVision)}`,
    `  Avg Wisdom:        ${colorScore(result.skyline.avgWisdom)}`,
    `  Overall Brilliance:${colorScore(result.skyline.overallBrilliance)}`,
    `  Is Platinum:       ${result.skyline.isPlatinum ? chalk.rgb(200, 200, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PlatinumHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
