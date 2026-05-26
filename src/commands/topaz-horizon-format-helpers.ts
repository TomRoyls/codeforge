import chalk from 'chalk'

import type { ObserverGrade, SkylineCondition, SkylineType, TopazCondition, TopazHorizonResult, TopazRay, TopazSkyline } from './topaz-horizon-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 193, 37)(String(score))
  if (score >= 75) return chalk.rgb(235, 173, 30)(String(score))
  if (score >= 60) return chalk.rgb(210, 150, 25)(String(score))
  if (score >= 40) return chalk.rgb(180, 125, 20)(String(score))
  if (score >= 20) return chalk.rgb(150, 100, 15)(String(score))
  return chalk.gray(String(score))
}

/** @example colorTopazCondition('topaz-masterpiece') */
export function colorTopazCondition(condition: TopazCondition | string): string {
  switch (condition) {
    case 'topaz-masterpiece': return chalk.rgb(255, 193, 37)('topaz-masterpiece')
    case 'imperial-gem': return chalk.rgb(235, 173, 30)('imperial-gem')
    case 'proper-topaz': return chalk.rgb(210, 150, 25)('proper-topaz')
    case 'pale-stone': return chalk.rgb(180, 125, 20)('pale-stone')
    case 'rough-crystal': return chalk.rgb(150, 100, 15)('rough-crystal')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorSkylineType('golden-skyline') */
export function colorSkylineType(type: SkylineType | string): string {
  switch (type) {
    case 'golden-skyline': return chalk.rgb(255, 193, 37)('golden-skyline')
    case 'warm-horizon': return chalk.rgb(235, 173, 30)('warm-horizon')
    case 'proper-landscape': return chalk.rgb(210, 150, 25)('proper-landscape')
    case 'flat-plain': return chalk.rgb(180, 125, 20)('flat-plain')
    case 'empty-sky': return chalk.rgb(150, 100, 15)('empty-sky')
    case 'no-skyline': return chalk.gray('no-skyline')
    default: return chalk.gray(String(type))
  }
}

/** @example colorSkylineCondition('topaz-palace') */
export function colorSkylineCondition(condition: SkylineCondition | string): string {
  switch (condition) {
    case 'topaz-palace': return chalk.rgb(255, 193, 37)('topaz-palace')
    case 'golden-tower': return chalk.rgb(235, 173, 30)('golden-tower')
    case 'proper-temple': return chalk.rgb(210, 150, 25)('proper-temple')
    case 'stone-building': return chalk.rgb(180, 125, 20)('stone-building')
    case 'wooden-hut': return chalk.rgb(150, 100, 15)('wooden-hut')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorObserverGrade('golden-master') */
export function colorObserverGrade(grade: ObserverGrade | string): string {
  switch (grade) {
    case 'golden-master': return chalk.rgb(255, 193, 37)('golden-master')
    case 'sunset-scholar': return chalk.rgb(235, 173, 30)('sunset-scholar')
    case 'proper-watcher': return chalk.rgb(210, 150, 25)('proper-watcher')
    case 'amateur': return chalk.rgb(180, 125, 20)('amateur')
    case 'novice': return chalk.rgb(150, 100, 15)('novice')
    case 'blind-folded': return chalk.gray('blind-folded')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatRayTable(ray) */
export function formatRayTable(ray: TopazRay): string {
  const lines: string[] = [
    chalk.bold(`Topaz Ray: ${ray.file}`),
    '',
    `  Golden Warmth:     ${colorScore(ray.goldenWarmth)}  ${chalk.dim(`(${ray.warming.glow})`)}`,
    `  Sunset Clarity:    ${colorScore(ray.sunsetClarity)}  ${chalk.dim(`(${ray.illuminating.light})`)}`,
    `  Fire Precision:    ${colorScore(ray.firePrecision)}  ${chalk.dim(`(${ray.focusing.beam})`)}`,
    `  Horizon Endurance: ${colorScore(ray.horizonEndurance)}  ${chalk.dim(`(${ray.spanning.reach})`)}`,
    `  Dawn Wisdom:       ${colorScore(ray.dawnWisdom)}  ${chalk.dim(`(${ray.transitioning.twilight})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${ray.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: TopazRay[]): string {
  if (rays.length === 0) return chalk.dim('No topaz rays found')
  const lines: string[] = [chalk.bold('Topaz Rays'), '']
  for (const r of rays) {
    lines.push(`  ${chalk.rgb(255, 193, 37)(r.file)}  Warm:${colorScore(r.goldenWarmth)}  Cla:${colorScore(r.sunsetClarity)}  Score:${colorScore(r.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatSkylineTable(skyline) */
export function formatSkylineTable(skyline: TopazSkyline): string {
  const lines: string[] = [
    chalk.bold(`Topaz Skyline: ${skyline.directory}`),
    '',
    `  Rays:           ${skyline.rays.length}`,
    `  Avg Warmth:     ${colorScore(skyline.avgWarmth)}`,
    `  Avg Precision:  ${colorScore(skyline.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(skyline.avgWisdom)}`,
    `  Masterpieces:   ${skyline.topazMasterpieceCount}`,
    `  Type:           ${colorSkylineType(skyline.skylineType)}`,
    `  Condition:      ${colorSkylineCondition(skyline.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatSkylinesTable(skylines) */
export function formatSkylinesTable(skylines: TopazSkyline[]): string {
  if (skylines.length === 0) return chalk.dim('No topaz skylines found')
  const lines: string[] = [chalk.bold('Topaz Skylines'), '']
  for (const s of skylines) {
    lines.push(`  ${chalk.rgb(255, 193, 37)(s.directory)}  ${colorScore(s.avgWarmth)}  ${colorSkylineCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TopazHorizonResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Topaz Horizon Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Skylines:         ${stats.totalSkylines}`,
    `  Avg Golden Warmth:      ${colorScore(stats.avgGoldenWarmth)}`,
    `  Avg Sunset Clarity:     ${colorScore(stats.avgSunsetClarity)}`,
    `  Avg Fire Precision:     ${colorScore(stats.avgFirePrecision)}`,
    `  Avg Horizon Endurance:  ${colorScore(stats.avgHorizonEndurance)}`,
    `  Avg Dawn Wisdom:        ${colorScore(stats.avgDawnWisdom)}`,
    `  Topaz Masterpieces:     ${stats.topazMasterpieceCount}`,
    `  Imperial Gems:          ${stats.imperialGemCount}`,
    `  Proper Topaz:           ${stats.properTopazCount}`,
    `  Pale Stone:             ${stats.paleStoneCount}`,
    `  Rough Crystal:          ${stats.roughCrystalCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Radiance:       ${colorScore(stats.overallRadiance)}`,
    `  Observer Grade:         ${colorObserverGrade(stats.observerGrade)}`,
    `  Best Ray:               ${stats.bestRay || 'N/A'}`,
    `  Warmest:                ${stats.warmest || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:          ${stats.mostEnduring || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 193, 37)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TopazHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Topaz Horizon Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatSkylinesTable(result.skylines),
    '',
    chalk.bold('Sunset Overview'),
    '',
    `  Avg Warmth:       ${colorScore(result.sunset.avgWarmth)}`,
    `  Avg Precision:    ${colorScore(result.sunset.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.sunset.avgWisdom)}`,
    `  Overall Radiance: ${colorScore(result.sunset.overallRadiance)}`,
    `  Is Topaz:         ${result.sunset.isTopaz ? chalk.rgb(255, 193, 37)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TopazHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
