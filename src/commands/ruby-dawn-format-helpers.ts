// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { RubyDawnResult, RubyRay, RubySunrise } from './ruby-dawn-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const RUBY = chalk.rgb(220, 40, 60)
const DAWN = chalk.rgb(255, 140, 60)
const GEM = chalk.rgb(200, 80, 100)
const DIM = chalk.rgb(150, 130, 135)
const BULLET = '\u{1F48E}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return RUBY.bold(String(score))
  if (score >= 60) return DAWN(String(score))
  if (score >= 40) return GEM.bold(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('ruby-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('ruby') || grade.includes('inferno') || grade.includes('crystal') || grade.includes('radiant') || grade.includes('surgical') || grade.includes('iron') || grade.includes('master-gemologist') || grade.includes('crimson-horizon') || grade.includes('magnificent')) return RUBY.bold(grade)
  if (grade.includes('blazing') || grade.includes('bright') || grade.includes('gentle') || grade.includes('precise') || grade.includes('strong') || grade.includes('expert') || grade.includes('ruby-sunrise') || grade.includes('beautiful')) return DAWN(grade)
  if (grade.includes('proper') || grade.includes('skilled-cutter') || grade.includes('proper-dawn') || grade.includes('proper-morning')) return GEM.bold(grade)
  return DIM(grade)
}

// ─── Ray Table ─────────────────────────────────────────────────────

/**
 * @example formatRayTable(ray)
 */
export function formatRayTable(ray: RubyRay): string {
  const lines: string[] = []
  lines.push(RUBY.bold(`${BULLET} ${ray.file}`))
  lines.push(`  Crimson Energy   : ${colorScore(ray.crimsonEnergy)}  ${colorGrade(ray.energizing.flame)}`)
  lines.push(`  Dawn Clarity     : ${colorScore(ray.dawnClarity)}  ${colorGrade(ray.illuminating.dawn)}`)
  lines.push(`  Gem Warmth       : ${colorScore(ray.gemWarmth)}  ${colorGrade(ray.warming.glow)}`)
  lines.push(`  Fire Precision   : ${colorScore(ray.firePrecision)}  ${colorGrade(ray.burning.fire)}`)
  lines.push(`  Blood Resilience : ${colorScore(ray.bloodResilience)}  ${colorGrade(ray.sustaining.blood)}`)
  lines.push(`  Quality Score    : ${colorScore(ray.qualityScore)}  ${colorGrade(ray.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatRaysTable(rays)
 */
export function formatRaysTable(rays: RubyRay[]): string {
  if (rays.length === 0) return chalk.gray('No ruby rays to display')
  return rays.map(formatRayTable).join('\n\n')
}

// ─── Sunrise Table ─────────────────────────────────────────────────

/**
 * @example formatSunriseTable(sunrise)
 */
export function formatSunriseTable(sunrise: RubySunrise): string {
  const lines: string[] = []
  lines.push(RUBY.bold(`${BULLET} ${sunrise.directory}`))
  lines.push(`  Rays              : ${sunrise.rays.length}`)
  lines.push(`  Avg Energy        : ${colorScore(sunrise.avgEnergy)}`)
  lines.push(`  Avg Clarity       : ${colorScore(sunrise.avgClarity)}`)
  lines.push(`  Avg Resilience    : ${colorScore(sunrise.avgResilience)}`)
  lines.push(`  Ruby Masterpiece  : ${sunrise.rubyMasterpieceCount}`)
  lines.push(`  Dust              : ${sunrise.dustCount}`)
  lines.push(`  Sunrise Type      : ${colorGrade(sunrise.sunriseType)}`)
  lines.push(`  Condition         : ${colorGrade(sunrise.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatSunrisesTable(sunrises)
 */
export function formatSunrisesTable(sunrises: RubySunrise[]): string {
  if (sunrises.length === 0) return chalk.gray('No ruby sunrises to display')
  return sunrises.map(formatSunriseTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: RubyDawnResult['stats']): string {
  const lines: string[] = []
  lines.push(RUBY.bold('Ruby Dawn Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Sunrises     : ${stats.totalSunrises}`)
  lines.push(`  Avg Crimson Energy : ${colorScore(stats.avgCrimsonEnergy)}`)
  lines.push(`  Avg Dawn Clarity   : ${colorScore(stats.avgDawnClarity)}`)
  lines.push(`  Avg Gem Warmth     : ${colorScore(stats.avgGemWarmth)}`)
  lines.push(`  Avg Fire Precision : ${colorScore(stats.avgFirePrecision)}`)
  lines.push(`  Avg Blood Resilience: ${colorScore(stats.avgBloodResilience)}`)
  lines.push(`  Ruby Masterpiece   : ${stats.rubyMasterpieceCount}`)
  lines.push(`  Crimson Gem        : ${stats.crimsonGemCount}`)
  lines.push(`  Proper Ruby        : ${stats.properRubyCount}`)
  lines.push(`  Cloudy Stone       : ${stats.cloudyStoneCount}`)
  lines.push(`  Rough Rock         : ${stats.roughRockCount}`)
  lines.push(`  Dust               : ${stats.dustCount}`)
  lines.push(`  Overall Brilliance : ${colorScore(stats.overallBrilliance)}`)
  lines.push(`  Jeweler Grade      : ${colorGrade(stats.jewelerGrade)}`)
  lines.push(`  Best Ray           : ${DAWN(stats.bestRay)}`)
  lines.push(`  Most Energetic     : ${DAWN(stats.mostEnergetic)}`)
  lines.push(`  Clearest           : ${DAWN(stats.clearest)}`)
  lines.push(`  Warmest            : ${DAWN(stats.warmest)}`)
  lines.push(`  Most Resilient     : ${DAWN(stats.mostResilient)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${DAWN(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: RubyDawnResult): string {
  const sections: string[] = []

  sections.push(RUBY.bold('Ruby Ray Analysis'))
  sections.push(formatRaysTable(result.rays))
  sections.push('')
  sections.push(RUBY.bold('Ruby Sunrises'))
  sections.push(formatSunrisesTable(result.sunrises))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(RUBY.bold('Horizon'))
  sections.push(`  Avg Energy       : ${colorScore(result.horizon.avgEnergy)}`)
  sections.push(`  Avg Clarity      : ${colorScore(result.horizon.avgClarity)}`)
  sections.push(`  Avg Resilience   : ${colorScore(result.horizon.avgResilience)}`)
  sections.push(`  Is Ruby          : ${result.horizon.isRuby ? RUBY.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Brilliance: ${colorScore(result.horizon.overallBrilliance)}`)
  sections.push('')
  sections.push(RUBY.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: RubyDawnResult): string {
  return JSON.stringify(result, null, 2)
}
