import chalk from 'chalk'

import type { AstronomerGrade, MoonstoneCondition, MoonstoneEclipseResult, MoonstonePhase, MoonstoneRay, PhaseCondition, PhaseType } from './moonstone-eclipse-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 210, 230)(String(score))
  if (score >= 75) return chalk.rgb(170, 180, 210)(String(score))
  if (score >= 60) return chalk.rgb(140, 155, 190)(String(score))
  if (score >= 40) return chalk.rgb(110, 125, 165)(String(score))
  if (score >= 20) return chalk.rgb(80, 95, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorMoonstoneCondition('moonstone-masterpiece') */
export function colorMoonstoneCondition(condition: MoonstoneCondition | string): string {
  switch (condition) {
    case 'moonstone-masterpiece': return chalk.rgb(200, 210, 230)('moonstone-masterpiece')
    case 'lunar-gem': return chalk.rgb(170, 180, 210)('lunar-gem')
    case 'proper-moonstone': return chalk.rgb(140, 155, 190)('proper-moonstone')
    case 'cloudy-stone': return chalk.rgb(110, 125, 165)('cloudy-stone')
    case 'dark-rock': return chalk.rgb(80, 95, 140)('dark-rock')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorPhaseType('full-moon') */
export function colorPhaseType(type: PhaseType | string): string {
  switch (type) {
    case 'full-moon': return chalk.rgb(200, 210, 230)('full-moon')
    case 'waxing-gibbous': return chalk.rgb(170, 180, 210)('waxing-gibbous')
    case 'proper-quarter': return chalk.rgb(140, 155, 190)('proper-quarter')
    case 'waning-crescent': return chalk.rgb(110, 125, 165)('waning-crescent')
    case 'new-moon': return chalk.rgb(80, 95, 140)('new-moon')
    case 'no-phase': return chalk.gray('no-phase')
    default: return chalk.gray(String(type))
  }
}

/** @example colorPhaseCondition('moonstone-palace') */
export function colorPhaseCondition(condition: PhaseCondition | string): string {
  switch (condition) {
    case 'moonstone-palace': return chalk.rgb(200, 210, 230)('moonstone-palace')
    case 'lunar-tower': return chalk.rgb(170, 180, 210)('lunar-tower')
    case 'proper-observatory': return chalk.rgb(140, 155, 190)('proper-observatory')
    case 'stone-circle': return chalk.rgb(110, 125, 165)('stone-circle')
    case 'empty-field': return chalk.rgb(80, 95, 140)('empty-field')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorAstronomerGrade('eclipse-master') */
export function colorAstronomerGrade(grade: AstronomerGrade | string): string {
  switch (grade) {
    case 'eclipse-master': return chalk.rgb(200, 210, 230)('eclipse-master')
    case 'lunar-scholar': return chalk.rgb(170, 180, 210)('lunar-scholar')
    case 'proper-observer': return chalk.rgb(140, 155, 190)('proper-observer')
    case 'amateur': return chalk.rgb(110, 125, 165)('amateur')
    case 'novice': return chalk.rgb(80, 95, 140)('novice')
    case 'blind-folded': return chalk.gray('blind-folded')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatRayTable(ray) */
export function formatRayTable(ray: MoonstoneRay): string {
  const lines: string[] = [
    chalk.bold(`Moonstone Ray: ${ray.file}`),
    '',
    `  Lunar Luminescence:  ${colorScore(ray.lunarLuminescence)}  ${chalk.dim(`(${ray.glowing.light})`)}`,
    `  Shadow Clarity:      ${colorScore(ray.shadowClarity)}  ${chalk.dim(`(${ray.revealing.shadow})`)}`,
    `  Tide Precision:      ${colorScore(ray.tidePrecision)}  ${chalk.dim(`(${ray.aligning.alignment})`)}`,
    `  Eclipse Resilience:  ${colorScore(ray.eclipseResilience)}  ${chalk.dim(`(${ray.enduring.phase})`)}`,
    `  Lunar Wisdom:        ${colorScore(ray.lunarWisdom)}  ${chalk.dim(`(${ray.understanding.cycle})`)}`,
    '',
    `  Quality Score: ${colorScore(ray.qualityScore)}  ${chalk.dim(`(${ray.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatRaysTable(rays) */
export function formatRaysTable(rays: MoonstoneRay[]): string {
  if (rays.length === 0) return chalk.dim('No moonstone rays found')
  const lines: string[] = [chalk.bold('Moonstone Rays'), '']
  for (const r of rays) {
    lines.push(`  ${chalk.rgb(200, 210, 230)(r.file)}  Lum:${colorScore(r.lunarLuminescence)}  Clr:${colorScore(r.shadowClarity)}  Score:${colorScore(r.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatPhaseTable(phase) */
export function formatPhaseTable(phase: MoonstonePhase): string {
  const lines: string[] = [
    chalk.bold(`Moonstone Phase: ${phase.directory}`),
    '',
    `  Rays:              ${phase.rays.length}`,
    `  Avg Luminescence:  ${colorScore(phase.avgLuminescence)}`,
    `  Avg Precision:     ${colorScore(phase.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(phase.avgWisdom)}`,
    `  Masterpieces:      ${phase.moonstoneMasterpieceCount}`,
    `  Phase Type:        ${colorPhaseType(phase.phaseType)}`,
    `  Condition:         ${colorPhaseCondition(phase.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatPhasesTable(phases) */
export function formatPhasesTable(phases: MoonstonePhase[]): string {
  if (phases.length === 0) return chalk.dim('No moonstone phases found')
  const lines: string[] = [chalk.bold('Moonstone Phases'), '']
  for (const p of phases) {
    lines.push(`  ${chalk.rgb(200, 210, 230)(p.directory)}  ${colorScore(p.avgLuminescence)}  ${colorPhaseCondition(p.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: MoonstoneEclipseResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Moonstone Eclipse Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Phases:              ${stats.totalPhases}`,
    `  Avg Lunar Luminescence:    ${colorScore(stats.avgLunarLuminescence)}`,
    `  Avg Shadow Clarity:        ${colorScore(stats.avgShadowClarity)}`,
    `  Avg Tide Precision:        ${colorScore(stats.avgTidePrecision)}`,
    `  Avg Eclipse Resilience:    ${colorScore(stats.avgEclipseResilience)}`,
    `  Avg Lunar Wisdom:          ${colorScore(stats.avgLunarWisdom)}`,
    `  Moonstone Masterpieces:    ${stats.moonstoneMasterpieceCount}`,
    `  Lunar Gems:                ${stats.lunarGemCount}`,
    `  Proper Moonstone:          ${stats.properMoonstoneCount}`,
    `  Cloudy Stone:              ${stats.cloudyStoneCount}`,
    `  Dark Rock:                 ${stats.darkRockCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Luminescence:      ${colorScore(stats.overallLuminescence)}`,
    `  Astronomer Grade:          ${colorAstronomerGrade(stats.astronomerGrade)}`,
    `  Best Ray:                  ${stats.bestRay || 'N/A'}`,
    `  Brightest:                 ${stats.brightest || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Most Precise:              ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:            ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(200, 210, 230)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: MoonstoneEclipseResult): string {
  const lines: string[] = [
    chalk.bold('Moonstone Eclipse Analysis'),
    '',
    formatRaysTable(result.rays),
    '',
    formatPhasesTable(result.phases),
    '',
    chalk.bold('Eclipse Overview'),
    '',
    `  Avg Luminescence:      ${colorScore(result.eclipse.avgLuminescence)}`,
    `  Avg Precision:         ${colorScore(result.eclipse.avgPrecision)}`,
    `  Avg Wisdom:            ${colorScore(result.eclipse.avgWisdom)}`,
    `  Overall Luminescence:  ${colorScore(result.eclipse.overallLuminescence)}`,
    `  Is Moonstone:          ${result.eclipse.isMoonstone ? chalk.rgb(200, 210, 230)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: MoonstoneEclipseResult): string {
  return JSON.stringify(result, null, 2)
}
